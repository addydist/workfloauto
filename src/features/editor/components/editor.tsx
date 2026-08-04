"use client";

import { ErrorView, LoadingView } from "@/components/entity-components";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflow";
import { useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
  type Node,
  type Edge,
  NodeChange,
  EdgeChange,
  Connection,
  Background,
  Controls,
  MiniMap,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodeComponents } from "@/config/node-components";
import { AddNodeButton } from "./add-node-button";
import { AiWorkflowGenerator } from "./ai-generate-dialog";
import { useTheme } from "next-themes";
import { useSetAtom } from "jotai";

const AI_BUILDER_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_AI_BUILDER !== "false";
import { editorAtom } from "../store/atom";
import { NodeType } from "@/generated/prisma";
import { ExecuteWorkflowButton } from "./execute-workflow-button";

export const EditorError = () => {
  return <ErrorView message="Failed to load editor." />;
};
export const EditorLoading = () => {
  return <LoadingView message="Loading editor..." />;
};
export const Editor = ({ workflowId }: { workflowId: string }) => {
  const { data: workflow } = useSuspenseWorkflow(workflowId);
  const { resolvedTheme } = useTheme();
  const setEditor=useSetAtom(editorAtom);
  const [nodes, setNodes] = useState<Node[]>(workflow?.nodes);
  const [edges, setEdges] = useState<Edge[]>(workflow?.edges);
  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    []
  );
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    []
  );
  const hasManualTrigger=useMemo(()=>{
    return nodes.some((node)=>node.type===NodeType.MANUAL_TRIGGER);
  },[nodes]);
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeComponents}
        onInit={setEditor}
        colorMode={resolvedTheme === "dark" ? "dark" : "light"}
        fitView
        snapGrid={[10, 10]}
        snapToGrid
        panOnScroll
        panOnDrag={false}
        selectionOnDrag
      >
        <Background />
        <Controls/>
        <MiniMap/>
        {AI_BUILDER_ENABLED && (
          <Panel position="top-left">
            <AiWorkflowGenerator />
          </Panel>
        )}
        <Panel position="top-right">
          <AddNodeButton/>
        </Panel>
        {hasManualTrigger &&(
          <Panel position="bottom-center">
            <ExecuteWorkflowButton workflowId={workflowId} />
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};
