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
const google = createGoogleGenerativeAI();
export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow", retries: 0,onFailure:async({event,step})=>{
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
    const sortedNodes = await step.run("prepare-workflow", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        include: { nodes: true, connections: true },
      });
      if (!workflow) {
        throw new NonRetriableError("Workflow not found");
      }
      return topologicalSort(workflow.nodes, workflow.connections);
    });
    const userId = await step.run("find-user-id", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        select: {
          userId: true,
        },
      });
      return workflow.userId;
    });
    let context = event.data.initialData || {};
    for (const node of sortedNodes) {
      const executor = getExecutor(node.type as NodeType);
      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        context,
        userId,
        step,
        publish,
      });
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
