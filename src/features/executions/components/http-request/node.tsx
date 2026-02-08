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
import { HttpRequestDialog } from "./dialog";

type HttpRequestNodeData = {
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: string;
  [key: string]: unknown;
};

type HttpRequestNodeType = Node<HttpRequestNodeData>;

export const HttpRequestNode = memo((props: NodeProps<HttpRequestNodeType>) => {
  const nodeData = props.data;
  const [DialogOpen, setDialogOpen] = useState(false);
  const description = nodeData.endpoint
    ? `${nodeData.method || "GET"} ${nodeData.endpoint || ""}`
    : "No endpoint configured";
  const nodeStatus = "initial";
  const { setNodes } = useReactFlow();
  const handleOpenSettings = () => setDialogOpen(true);
  const handleSubmit = (values: {
    endpoint: string;
    method: string;
    body?: string;
  }) => {
    setNodes((nodes) => {
      const updatedNodes = nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              endpoint: values.endpoint,
              method: values.method,
              body: values.body,
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
      <HttpRequestDialog
        open={DialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultEndpoint={nodeData.endpoint}
        defaultMethod={nodeData.method}
        defaultBody={nodeData.body}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={GlobeIcon}
        name="HTTP Request"
        description={description}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});
