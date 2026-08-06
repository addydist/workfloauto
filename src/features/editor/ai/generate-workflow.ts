"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createId } from "@paralleldrive/cuid2";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { CredentialType } from "@/generated/prisma";
import { CONDITION_OPERATORS } from "@/features/executions/components/condition/constants";
import type { GeneratedEdge, GeneratedNode, GenerateResult } from "./types";

// Node types the generator is allowed to emit (excludes triggers that need
// external setup, and the INITIAL placeholder).
const GEN_NODE_TYPES = [
  "MANUAL_TRIGGER",
  "SCHEDULE_TRIGGER",
  "HTTP_REQUEST",
  "GEMINI",
  "OPENAI",
  "ANTHROPIC",
  "DISCORD",
  "SLACK",
  "CONDITION",
] as const;
type GenNodeType = (typeof GEN_NODE_TYPES)[number];

const TRIGGER_TYPES: GenNodeType[] = ["MANUAL_TRIGGER", "SCHEDULE_TRIGGER"];
const operatorValues = CONDITION_OPERATORS.map((o) => o.value) as [
  string,
  ...string[],
];

const genSchema = z.object({
  title: z.string().describe("A short, human name for the workflow."),
  nodes: z
    .array(
      z.object({
        key: z
          .string()
          .describe("Unique lowercase identifier for this step, e.g. 'ask_ai'."),
        type: z.enum(GEN_NODE_TYPES),
        data: z
          .object({
            variableName: z
              .string()
              .optional()
              .describe("Identifier to reference this step's output later."),
            endpoint: z.string().optional(),
            method: z.enum(["GET", "POST", "PUT", "DELETE"]).optional(),
            body: z.string().optional(),
            systemPrompt: z.string().optional(),
            userPrompt: z.string().optional(),
            content: z.string().optional(),
            username: z.string().optional(),
            leftValue: z.string().optional(),
            operator: z.enum(operatorValues).optional(),
            rightValue: z.string().optional(),
            frequency: z.enum(["minutes", "daily", "weekly"]).optional(),
            everyMinutes: z.number().optional(),
            hour: z.number().optional(),
            minute: z.number().optional(),
            weekday: z.number().optional(),
          })
          .describe("Config for this node. Fill the fields its type requires."),
      }),
    )
    .min(1)
    .max(12),
  connections: z
    .array(
      z.object({
        from: z.string().describe("Source node key."),
        to: z.string().describe("Target node key."),
        branch: z
          .enum(["true", "false"])
          .optional()
          .describe("Only for CONDITION source nodes: which branch this edge is."),
      }),
    )
    .describe("Directed edges wiring the steps together."),
});

type GenWorkflow = z.infer<typeof genSchema>;

const SYSTEM_PROMPT = `You are an expert automation architect for Nodeflo, a visual workflow tool. Turn the user's request into a runnable workflow graph of nodes and connections.

NODE TYPES you may use and their config fields:
- MANUAL_TRIGGER — the workflow's starting point, run on demand. No config.
- SCHEDULE_TRIGGER — starts the workflow automatically on a schedule. Use this INSTEAD of MANUAL_TRIGGER when the request implies timing ("every morning", "daily at 9am", "every 5 minutes", "weekly"). Fields: frequency ("minutes" | "daily" | "weekly"); for "minutes" set everyMinutes (5/10/15/30); for "daily"/"weekly" set hour (0-23) and minute (0-59); for "weekly" also set weekday (0=Sunday .. 6=Saturday).
- HTTP_REQUEST — call an API. Fields: variableName, endpoint (full URL), method (GET/POST/PUT/DELETE), body (JSON string, only for POST/PUT). Output is referenced as {{variableName.httpResponse.data}}.
- GEMINI / OPENAI / ANTHROPIC — call an AI model. Fields: variableName, userPrompt (required), systemPrompt (optional). Output is referenced as {{variableName.text}}. NEVER set credentials.
- DISCORD — send a Discord message. Fields: variableName, content (the message; may use {{variables}}), username (optional). NEVER set the webhook URL.
- SLACK — send a Slack message. Fields: variableName, content. NEVER set the webhook URL.
- CONDITION — branch the flow. Fields: leftValue, operator, rightValue. It has TWO outputs; wire downstream nodes using connection branch "true" or "false".

RULES:
- Start with exactly one trigger. Use SCHEDULE_TRIGGER when the request implies timing (e.g. "every morning at 9am" → daily, hour 9, minute 0); otherwise MANUAL_TRIGGER.
- Reference earlier outputs with {{variableName.field}} handlebars (e.g. {{ask_ai.text}}, {{fetch.httpResponse.data}}).
- variableName must be a valid identifier: letters, digits, underscores; start with a letter/underscore.
- Every non-trigger node must be reachable from the trigger. Connections form a DAG (no cycles).
- Keep it focused: prefer 3–7 nodes. Only add a CONDITION when the request implies a decision.
- To make AI return a clean value for a CONDITION (e.g. a number), instruct it in the prompt to reply with only that value.
- allowed operators: ${operatorValues.join(", ")}.
- Every GEMINI/OPENAI/ANTHROPIC node MUST include a concrete, non-empty userPrompt that states exactly what to ask; inject earlier outputs with {{variables}}.
- Every DISCORD/SLACK node MUST include non-empty content.

Return JSON shaped exactly like this example (fill data fields — never leave a prompt empty):
{
  "title": "Fun fact to Discord",
  "nodes": [
    { "key": "start", "type": "MANUAL_TRIGGER", "data": {} },
    { "key": "fact", "type": "GEMINI", "data": { "variableName": "fact", "userPrompt": "Give me one surprising fun fact in a single sentence." } },
    { "key": "post", "type": "DISCORD", "data": { "variableName": "posted", "content": "Fun fact: {{fact.text}}" } }
  ],
  "connections": [
    { "from": "start", "to": "fact" },
    { "from": "fact", "to": "post" }
  ]
}

Example WITH a condition branch — request: "Ask how many states India has; if more than 28, post a 'many' message to Discord, otherwise a 'few' message":
{
  "title": "India state check",
  "nodes": [
    { "key": "start", "type": "MANUAL_TRIGGER", "data": {} },
    { "key": "count", "type": "GEMINI", "data": { "variableName": "count", "userPrompt": "How many states does India have? Reply with only the number." } },
    { "key": "check", "type": "CONDITION", "data": { "leftValue": "{{count.text}}", "operator": "greater_than", "rightValue": "28" } },
    { "key": "many", "type": "DISCORD", "data": { "variableName": "many_msg", "content": "India has many states — {{count.text}}!" } },
    { "key": "few", "type": "DISCORD", "data": { "variableName": "few_msg", "content": "India has only {{count.text}} states." } }
  ],
  "connections": [
    { "from": "start", "to": "count" },
    { "from": "count", "to": "check" },
    { "from": "check", "to": "many", "branch": "true" },
    { "from": "check", "to": "few", "branch": "false" }
  ]
}`;

// A capable free OpenRouter model (overridable). OpenRouter is OpenAI-compatible.
const OPENROUTER_FREE_MODEL =
  process.env.OPENROUTER_MODEL ?? "deepseek/deepseek-chat-v3-0324:free";

/**
 * Resolve the model used for generation. Prefers the platform OpenRouter key
 * (free models → generation is free for every user), then falls back to the
 * user's own stored AI credential.
 */
async function resolveModel(userId: string) {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (openRouterKey) {
    const openrouter = createOpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: openRouterKey,
      headers: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_BASE_URL ?? "https://nodeflo.app",
        "X-Title": "Nodeflo",
      },
    });
    return openrouter(OPENROUTER_FREE_MODEL);
  }

  // Fallback: the user's own AI credential.
  const creds = await prisma.credential.findMany({
    where: {
      userId,
      type: {
        in: [CredentialType.GEMINI, CredentialType.OPENAI, CredentialType.ANTHROPIC],
      },
    },
  });
  if (creds.length === 0) return null;

  const pick =
    creds.find((c) => c.type === CredentialType.GEMINI) ??
    creds.find((c) => c.type === CredentialType.OPENAI) ??
    creds[0];

  const apiKey = decrypt(pick.value);

  if (pick.type === CredentialType.OPENAI) {
    return createOpenAI({ apiKey })("gpt-4o-mini");
  }
  if (pick.type === CredentialType.ANTHROPIC) {
    return createAnthropic({ apiKey })("claude-3-5-sonnet-latest");
  }
  return createGoogleGenerativeAI({ apiKey })("gemini-2.5-flash-lite");
}

/** Best-effort extraction of a JSON object from an LLM text response. */
function extractJson(text: string): unknown {
  let t = text.trim();
  const fenced = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) t = fenced[1].trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start === -1 || end <= start) {
    throw new Error("No JSON object found in the model response.");
  }
  return JSON.parse(t.slice(start, end + 1));
}

// --- graph building -------------------------------------------------------

const isTrigger = (t: string) => TRIGGER_TYPES.includes(t as GenNodeType);

/** Keep only the fields each node type actually uses; fill sane defaults. */
function sanitizeData(
  type: GenNodeType,
  key: string,
  data: NonNullable<GenWorkflow["nodes"][number]["data"]> = {},
): Record<string, unknown> {
  // A valid variableName is a short identifier. If the model returns garbage
  // (e.g. a long string or leaked reasoning), fall back to the node key.
  const nameRe = /^[A-Za-z_][A-Za-z0-9_]*$/;
  const candidate =
    data.variableName &&
    nameRe.test(data.variableName) &&
    data.variableName.length <= 40
      ? data.variableName
      : key.replace(/[^A-Za-z0-9_]/g, "_");
  const variableName = (candidate || "result").slice(0, 40);

  switch (type) {
    case "HTTP_REQUEST":
      return {
        variableName,
        endpoint: data.endpoint ?? "",
        method: data.method ?? "GET",
        body: data.body ?? "",
      };
    case "GEMINI":
    case "OPENAI":
    case "ANTHROPIC":
      return {
        variableName,
        systemPrompt: data.systemPrompt ?? "",
        userPrompt: data.userPrompt ?? "",
        credentialId: "",
      };
    case "DISCORD":
      return {
        variableName,
        content: data.content ?? "",
        username: data.username ?? "",
        webhookurl: "",
      };
    case "SLACK":
      return {
        variableName,
        content: data.content ?? "",
        webhookurl: "",
      };
    case "SCHEDULE_TRIGGER": {
      const frequency = data.frequency ?? "daily";
      if (frequency === "minutes") {
        return { frequency, everyMinutes: data.everyMinutes ?? 15 };
      }
      if (frequency === "weekly") {
        return {
          frequency,
          weekday: data.weekday ?? 1,
          hour: data.hour ?? 9,
          minute: data.minute ?? 0,
        };
      }
      // timezone omitted → the node dialog auto-detects it on first open.
      return { frequency: "daily", hour: data.hour ?? 9, minute: data.minute ?? 0 };
    }
    case "CONDITION":
      return {
        leftValue: data.leftValue ?? "",
        operator: data.operator ?? "equals",
        rightValue: data.rightValue ?? "",
      };
    default:
      return {};
  }
}

/** Layered left-to-right layout via longest-path depth (Kahn topological). */
function layout(
  nodeKeys: string[],
  edges: { from: string; to: string }[],
): Map<string, { x: number; y: number }> {
  const depth = new Map<string, number>(nodeKeys.map((k) => [k, 0]));
  const indegree = new Map<string, number>(nodeKeys.map((k) => [k, 0]));
  const adj = new Map<string, string[]>(nodeKeys.map((k) => [k, []]));
  for (const e of edges) {
    if (!adj.has(e.from) || !depth.has(e.to)) continue;
    adj.get(e.from)!.push(e.to);
    indegree.set(e.to, (indegree.get(e.to) ?? 0) + 1);
  }
  const queue = nodeKeys.filter((k) => (indegree.get(k) ?? 0) === 0);
  const seen = new Set<string>();
  while (queue.length) {
    const u = queue.shift()!;
    if (seen.has(u)) continue;
    seen.add(u);
    for (const v of adj.get(u) ?? []) {
      depth.set(v, Math.max(depth.get(v) ?? 0, (depth.get(u) ?? 0) + 1));
      indegree.set(v, (indegree.get(v) ?? 1) - 1);
      if ((indegree.get(v) ?? 0) <= 0) queue.push(v);
    }
  }
  const rowByDepth = new Map<number, number>();
  const positions = new Map<string, { x: number; y: number }>();
  for (const k of nodeKeys) {
    const d = depth.get(k) ?? 0;
    const row = rowByDepth.get(d) ?? 0;
    rowByDepth.set(d, row + 1);
    positions.set(k, { x: d * 300, y: row * 160 });
  }
  return positions;
}

function buildGraph(gen: GenWorkflow): {
  nodes: GeneratedNode[];
  edges: GeneratedEdge[];
  summary: string[];
} {
  // De-dupe keys and keep only supported types.
  const seenKeys = new Set<string>();
  let nodes = gen.nodes.filter((n) => {
    if (seenKeys.has(n.key) || !GEN_NODE_TYPES.includes(n.type)) return false;
    seenKeys.add(n.key);
    return true;
  });

  let connections = gen.connections.filter(
    (c) => seenKeys.has(c.from) && seenKeys.has(c.to) && c.from !== c.to,
  );

  // Ensure a trigger exists; if not, prepend a manual trigger to all roots.
  if (!nodes.some((n) => isTrigger(n.type))) {
    const targets = new Set(connections.map((c) => c.to));
    const roots = nodes.filter((n) => !targets.has(n.key));
    const triggerKey = "start_trigger";
    nodes = [{ key: triggerKey, type: "MANUAL_TRIGGER", data: {} }, ...nodes];
    seenKeys.add(triggerKey);
    connections = [
      ...roots.map((r) => ({ from: triggerKey, to: r.key })),
      ...connections,
    ];
  }

  const positions = layout(
    nodes.map((n) => n.key),
    connections,
  );
  const idByKey = new Map(nodes.map((n) => [n.key, createId()]));
  const typeByKey = new Map(nodes.map((n) => [n.key, n.type]));

  const outNodes: GeneratedNode[] = nodes.map((n) => ({
    id: idByKey.get(n.key)!,
    type: n.type,
    position: positions.get(n.key) ?? { x: 0, y: 0 },
    data: sanitizeData(n.type, n.key, n.data),
  }));

  const outEdges: GeneratedEdge[] = connections.map((c) => {
    const fromType = typeByKey.get(c.from);
    const sourceHandle =
      fromType === "CONDITION" ? (c.branch ?? "true") : "source-1";
    return {
      id: createId(),
      source: idByKey.get(c.from)!,
      target: idByKey.get(c.to)!,
      sourceHandle,
      targetHandle: "target-1",
    };
  });

  const label: Record<string, string> = {
    MANUAL_TRIGGER: "Manual Trigger",
    HTTP_REQUEST: "HTTP Request",
    GEMINI: "Gemini",
    OPENAI: "OpenAI",
    ANTHROPIC: "Anthropic",
    DISCORD: "Discord",
    SLACK: "Slack",
    CONDITION: "Condition",
  };
  const summary = nodes.map((n) => `${label[n.type] ?? n.type} — ${n.key}`);

  return { nodes: outNodes, edges: outEdges, summary };
}

// --- action ---------------------------------------------------------------

export async function generateWorkflow(prompt: string): Promise<GenerateResult> {
  const trimmed = (prompt ?? "").trim();
  if (trimmed.length < 3) {
    return { ok: false, error: "Describe the workflow you want to build." };
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { ok: false, error: "You must be signed in." };
  }

  try {
    const model = await resolveModel(session.user.id);
    if (!model) {
      return {
        ok: false,
        error:
          "AI generation isn't configured. Set OPENROUTER_API_KEY, or add an AI credential (Gemini, OpenAI, or Anthropic) in Credentials.",
      };
    }

    // Use generateText + manual JSON parsing so this works with any model,
    // including free OpenRouter models that lack structured-output support.
    const { text } = await generateText({
      model,
      system: SYSTEM_PROMPT,
      prompt: `${trimmed}\n\nRespond with ONLY the JSON object — no markdown fences, no commentary.`,
      temperature: 0.3,
    });

    const parsed = genSchema.safeParse(extractJson(text));
    if (!parsed.success) {
      return {
        ok: false,
        error: "The model returned an invalid workflow. Try rephrasing your request.",
      };
    }

    const { nodes, edges, summary } = buildGraph(parsed.data);
    if (nodes.length === 0) {
      return { ok: false, error: "Could not build a workflow from that prompt." };
    }
    return { ok: true, title: parsed.data.title, nodes, edges, summary };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Generation failed. Try again.";
    return { ok: false, error: message };
  }
}
