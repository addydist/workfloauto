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
import {  getOpenAitimeToken } from "./actions";
import { OPENAI_CHANNEL_NAME } from "@/inngest/channels/openai";
import { OpenAiDialog, OpenAiFormValues } from "./dialog";

type OpenAiNodeData = {
  variableName?: string;
  credentialId?: string ;
  systemPrompt?: string;
  userPrompt?: string;
};
 
type OpenAiRequestNodeType = Node<OpenAiNodeData>;

export const OpenAiNode = memo((props: NodeProps<OpenAiRequestNodeType>) => {
  const nodeData = props.data;
  const [DialogOpen, setDialogOpen] = useState(false);
  const description = nodeData.userPrompt
    ? `chatgpt-4o-latest: ${nodeData.userPrompt.slice(0,50)}...`
    : "No endpoint configured";
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: OPENAI_CHANNEL_NAME,
    topic: "status",
    refreshToken:getOpenAitimeToken,
});
  const { setNodes } = useReactFlow();
  const handleOpenSettings = () => setDialogOpen(true);
  const handleSubmit = (values: OpenAiFormValues) => {
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
      <OpenAiDialog
        open={DialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={'/logos/openai.svg'}
        name="OpenAi"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});
