"use client";

import {
  useReactFlow,
  type Node,
  type NodeProps,
  type Position,
} from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import {AVAILABLE_MODELS, GeminiDialog, GeminiFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/usee-node-status";
import { getGeminitimeToken } from "./actions";
import { GEMINI_CHANNEL_NAME } from "@/inngest/channels/gemini";

type GeminiNodeData = {
  variableName?: string;
  credentialId?: string ;
  systemPrompt?: string;
  userPrompt?: string;
};
 
type GeminiRequestNodeType = Node<GeminiNodeData>;

export const GeminiNode = memo((props: NodeProps<GeminiRequestNodeType>) => {
  const nodeData = props.data;
  const [DialogOpen, setDialogOpen] = useState(false);
  const description = nodeData.userPrompt
    ? `gpt-4o-mini: ${nodeData.userPrompt.slice(0,50)}...`
    : "No endpoint configured";
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: GEMINI_CHANNEL_NAME,
    topic: "status",
    refreshToken:getGeminitimeToken,
});
  const { setNodes } = useReactFlow();
  const handleOpenSettings = () => setDialogOpen(true);
  const handleSubmit = (values: GeminiFormValues) => {
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
      <GeminiDialog
        open={DialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={'/logos/gemini.svg'}
        name="Gemini"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});
