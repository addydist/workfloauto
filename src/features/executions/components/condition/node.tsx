"use client";

import {
  type Node,
  type NodeProps,
  Position,
  useReactFlow,
} from "@xyflow/react";
import { GitBranchIcon } from "lucide-react";
import { memo, useState } from "react";

import { BaseNode } from "@/components/react-flow/base-node";
import { BaseHandle } from "@/components/react-flow/base-handle";
import { WorkflowNode } from "@/components/workflow-node";
import {
  NodeStatusIndicator,
} from "@/components/react-flow/node-status-indicator";
import { cn } from "@/lib/utils";
import { useNodeStatus } from "../../hooks/usee-node-status";
import { CONDITION_CHANNEL_NAME } from "@/inngest/channels/condition";
import { getConditionRealtimeToken } from "./actions";
import { ConditionDialog, type ConditionFormValues } from "./dialog";
import { CONDITION_OPERATORS, type ConditionData } from "./constants";

type ConditionNodeType = Node<ConditionData>;

const describe = (data: ConditionData): string => {
  if (!data.leftValue) return "No condition configured";
  const operatorLabel =
    CONDITION_OPERATORS.find((op) => op.value === (data.operator ?? "equals"))
      ?.label ?? "";
  return `${data.leftValue} ${operatorLabel} ${data.rightValue ?? ""}`.trim();
};

export const ConditionNode = memo((props: NodeProps<ConditionNodeType>) => {
  const nodeData = props.data;
  const [dialogOpen, setDialogOpen] = useState(false);

  const status = useNodeStatus({
    nodeId: props.id,
    channel: CONDITION_CHANNEL_NAME,
    topic: "status",
    refreshToken: getConditionRealtimeToken,
  });

  const { setNodes, setEdges } = useReactFlow();

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: ConditionFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === props.id
          ? { ...node, data: { ...node.data, ...values } }
          : node,
      ),
    );
  };

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== props.id));
    setEdges((edges) =>
      edges.filter(
        (edge) => edge.source !== props.id && edge.target !== props.id,
      ),
    );
  };

  return (
    <>
      <ConditionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <WorkflowNode
        name="Condition"
        description={describe(nodeData)}
        onDelete={handleDelete}
        onSettings={handleOpenSettings}
      >
        <NodeStatusIndicator
          status={status}
          variant="border"
          className="rounded-l-2xl"
        >
          <BaseNode
            status={status}
            onDoubleClick={handleOpenSettings}
            className={cn(
              "min-w-[150px] p-0",
              status && status !== "initial" && "border-transparent bg-clip-padding",
            )}
          >
            {/* Header */}
            <div className="flex items-center gap-2 border-b px-3 py-2">
              <GitBranchIcon className="size-4 text-muted-foreground" />
              <span className="text-xs font-medium">Condition</span>
            </div>

            {/* True branch output */}
            <div className="relative flex items-center justify-end py-1.5 pl-3">
              <span className="mr-3 text-xs font-bold uppercase text-chart-4">
                True
              </span>
              <BaseHandle
                id="true"
                type="source"
                position={Position.Right}
                className="border-chart-4! bg-chart-4!"
              />
            </div>

            {/* False branch output */}
            <div className="relative flex items-center justify-end border-t py-1.5 pl-3">
              <span className="mr-3 text-xs font-bold uppercase text-chart-1">
                False
              </span>
              <BaseHandle
                id="false"
                type="source"
                position={Position.Right}
                className="border-chart-1! bg-chart-1!"
              />
            </div>

            {/* Input */}
            <BaseHandle id="target-1" type="target" position={Position.Left} />
          </BaseNode>
        </NodeStatusIndicator>
      </WorkflowNode>
    </>
  );
});

ConditionNode.displayName = "ConditionNode";
