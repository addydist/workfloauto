"use client";

import {
  useReactFlow,
  type Node,
  type NodeProps,
  type Position,
} from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { DiscordDialog, DiscordFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/usee-node-status";
import { getdiscordtimeToken } from "./actions";
import { DISCORD_CHANNEL_NAME } from "@/inngest/channels/discord";

type DiscordNodeData = {
 webhookUrl?:string;
 content?:string;
 username?:string;
};
 
type DiscordRequestNodeType = Node<DiscordNodeData>;

export const DiscordNode = memo((props: NodeProps<DiscordRequestNodeType>) => {
  const nodeData = props.data;
  const [DialogOpen, setDialogOpen] = useState(false);
  const description = nodeData.content
    ? `Sent: ${nodeData.content.slice(0,50)}...`
    : "Not configured";
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: DISCORD_CHANNEL_NAME,
    topic: "status",
    refreshToken:getdiscordtimeToken,
});
  const { setNodes } = useReactFlow();
  const handleOpenSettings = () => setDialogOpen(true);
  const handleSubmit = (values: DiscordFormValues) => {
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
      <DiscordDialog
        open={DialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={'/logos/discord.svg'}
        name="Discord"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});
