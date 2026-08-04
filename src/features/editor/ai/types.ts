// Shared, runtime-free types for the AI workflow generator. Kept out of the
// "use server" action file so both server and client can import them.

export type GeneratedNode = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
};

export type GeneratedEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
};

export type GenerateResult =
  | {
      ok: true;
      title: string;
      nodes: GeneratedNode[];
      edges: GeneratedEdge[];
      /** Human-readable step list for the preview. */
      summary: string[];
    }
  | { ok: false; error: string };
