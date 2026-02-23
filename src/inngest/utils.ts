import { Connection, Node } from "@/generated/prisma";
import toposort from "toposort";
import { inngest } from "./client";
export const topologicalSort = (
  nodes: Node[],
  connections: Connection[]
): Node[] => {
  if (connections.length === 0) {
    return nodes;
  }
  const edges: [string, string][] = connections.map((connection) => [
    connection.fromNodeId,
    connection.toNodeId,
  ]);

  const connectedNodeIds = new Set<string>();
  for (const conn of connections) {
    connectedNodeIds.add(conn.fromNodeId);
    connectedNodeIds.add(conn.toNodeId);
  }
  for (const node of nodes) {
    if (!connectedNodeIds.has(node.id)) {
      edges.push([node.id, node.id]);
    }
  }



  let sortedNodeIds: string[];
  try{
    sortedNodeIds = toposort(edges);
    sortedNodeIds=[...new Set(sortedNodeIds)];
  }catch(e){
   if(e instanceof Error && e.message.includes("Cyclic")) {
    throw new Error(`Cyclic dependency detected in workflow: ${e.message}`);
   } 
   throw e;
  }


  const nodeMap = new Map(nodes.map((node) => [node.id, node]));    
  return sortedNodeIds.map((id) => nodeMap.get(id)!).filter(Boolean);
};


export const sendWorkflowExecutionEvent = async (data:{
  workflowId: string;
  [key: string]: unknown;
})=>{
  return inngest.send({
    name: "workflow/execute.workflow",
    data,
  });

}