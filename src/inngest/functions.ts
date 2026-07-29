import prisma from "@/lib/db";
import { inngest } from "./client";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { gemini, NonRetriableError } from "inngest";
import { topologicalSort } from "./utils";
import { ExecutionStatus, NodeType } from "@/generated/prisma";
import { getExecutor } from "@/features/executions/lib/executor-registry";
import { httpRequestChannel } from "./channels/http-request";
import { manualTriggerChannel } from "./channels/manual-request";
import { googleFromTriggerChannel } from "./channels/google-form-trigger";
import { stripeTriggerChannel } from "./channels/stipe-request";
import { geminiChannel } from "./channels/gemini";
import { openAiChannel } from "./channels/openai";
import { anthropicChannel } from "./channels/anthropic";
import { discordChannel } from "./channels/discord";
import { slackChannel } from "./channels/slack";
import { conditionChannel } from "./channels/condition";
import { runConditionNode } from "@/features/executions/components/condition/executor";
import type { ConditionData } from "@/features/executions/components/condition/constants";
const google = createGoogleGenerativeAI();
export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow", retries: process.env.NODE_ENV==="production"?3:0 ,onFailure:async({event,step})=>{
    return prisma.execution.update({
      where:{inngestEventId:event.data.event.id},
      data:{
        status:ExecutionStatus.FAILED,
        error:event.data.error.message,
        errorStack:event.data.error.stack
      }
    })
  } },
  {
    event: "workflow/execute.workflow",
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFromTriggerChannel(),
      stripeTriggerChannel(),
      geminiChannel(),
      openAiChannel(),
      anthropicChannel(),
      discordChannel(),
      slackChannel(),
      conditionChannel(),
    ],
  },
  async ({ event, step, publish }) => {
    const inngestEventId = event.id;
    const workflowId = event.data.workflowId;
    if (!inngestEventId || !workflowId) {
      throw new NonRetriableError("Event Id or workflow ID provided");
    }
    await step.run("create-execution", async () => {
      return prisma.execution.create({
        data: {
          workflowId,
          inngestEventId,
        },
      });
    });
    const { sortedNodes, connections } = await step.run(
      "prepare-workflow",
      async () => {
        const workflow = await prisma.workflow.findUniqueOrThrow({
          where: { id: workflowId },
          include: { nodes: true, connections: true },
        });
        if (!workflow) {
          throw new NonRetriableError("Workflow not found");
        }
        return {
          sortedNodes: topologicalSort(workflow.nodes, workflow.connections),
          connections: workflow.connections,
        };
      },
    );
    const userId = await step.run("find-user-id", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        select: {
          userId: true,
        },
      });
      return workflow.userId;
    });
    // Group incoming connections per node so we can decide, at execution time,
    // whether a node is reachable given the branches taken so far.
    const incomingByNode = new Map<string, typeof connections>();
    for (const connection of connections) {
      const list = incomingByNode.get(connection.toNodeId) ?? [];
      list.push(connection);
      incomingByNode.set(connection.toNodeId, list);
    }

    // For each executed node, which of its output handles are "live".
    // "ALL" means every outgoing edge is active (normal nodes); a Set means
    // only edges whose `fromOutput` is in the set are active (condition nodes).
    const activeOutputs = new Map<string, Set<string> | "ALL">();
    const executed = new Set<string>();

    const isReachable = (nodeId: string): boolean => {
      const incoming = incomingByNode.get(nodeId);
      // Roots (triggers / disconnected nodes) always run.
      if (!incoming || incoming.length === 0) return true;
      return incoming.some((connection) => {
        if (!executed.has(connection.fromNodeId)) return false;
        const outputs = activeOutputs.get(connection.fromNodeId);
        if (outputs === "ALL" || outputs === undefined) return true;
        return outputs.has(connection.fromOutput);
      });
    };

    let context = event.data.initialData || {};
    for (const node of sortedNodes) {
      // Skip nodes downstream of a branch that wasn't taken.
      if (!isReachable(node.id)) {
        continue;
      }

      if (node.type === NodeType.CONDITION) {
        const result = await runConditionNode({
          data: node.data as ConditionData,
          nodeId: node.id,
          context,
          userId,
          step,
          publish,
        });
        context = result.context;
        // Only the taken branch's output edges stay live.
        activeOutputs.set(node.id, new Set([result.taken]));
      } else {
        const executor = getExecutor(node.type as NodeType);
        context = await executor({
          data: node.data as Record<string, unknown>,
          nodeId: node.id,
          context,
          userId,
          step,
          publish,
        });
        activeOutputs.set(node.id, "ALL");
      }

      executed.add(node.id);
    }
    await step.run("update-execution", async () => {
      return prisma.execution.update({
        where:{ inngestEventId,workflowId},
        data: {
           status:ExecutionStatus.SUCCESS,
           completedAt:new Date(),
           output:context
        },
      });
    });
    return { workflowId, context };
  },
);
