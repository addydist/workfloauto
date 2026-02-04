"use client";

import type { Node, NodeProps, Position } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";

type HttpRequestNodeData = {
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: string;
  [key: string]: unknown;
};

type HttpRequestNodeType = Node<HttpRequestNodeData>;

export const HttpRequestNode = memo((props: NodeProps<HttpRequestNodeType>) => {
  const nodeData = props.data as HttpRequestNodeData;
  const description = nodeData.endpoint
    ? `${nodeData.method || "GET"} ${nodeData.endpoint || ""}`
    : "No endpoint configured";

  return (
    <>
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={GlobeIcon}
        name="HTTP Request"
        description={description}
        onSettings={() => {
          console.log("Open settings for node", props.id);
        }}
        onDoubleClick={() => {
          console.log("Open details for node", props.id);
        }}
      ></BaseExecutionNode>
    </>
  );
});
