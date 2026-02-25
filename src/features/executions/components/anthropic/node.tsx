"use client";

import {
  useReactFlow,
  type Node,
  type NodeProps,
  type Position,
} from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { useNodeStatus } from "../../hooks/usee-node-status";
import {  getAnthropictimeToken } from "./actions";
import { AnthropicDialog, AnthropicFormValues } from "./dialog";
import { ANTHROPIC_CHANNEL_NAME } from "@/inngest/channels/anthropic";

type AnthropicNodeData = {
  variableName?: string;
  model?: string ;
  systemPrompt?: string;
  userPrompt?: string;
};
 
type AnthropicRequestNodeType = Node<AnthropicNodeData>;

export const AnthropicNode = memo((props: NodeProps<AnthropicRequestNodeType>) => {
  const nodeData = props.data;
  const [DialogOpen, setDialogOpen] = useState(false);
  const description = nodeData.userPrompt
    ? `claude-sonnet-4-6: ${nodeData.userPrompt.slice(0,50)}...`
    : "No endpoint configured";
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: ANTHROPIC_CHANNEL_NAME,
    topic: "status",
    refreshToken:getAnthropictimeToken,
});
  const { setNodes } = useReactFlow();
  const handleOpenSettings = () => setDialogOpen(true);
  const handleSubmit = (values: AnthropicFormValues) => {
    setNodes((nodes) => {
      const updatedNodes = nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...values,
            },
          };
        }
        return node;
      });
      return updatedNodes;
    });
  };
  return (
    <>
      <AnthropicDialog
        open={DialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={'/logos/anthropic.svg'}
        name="Anthropic"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});
