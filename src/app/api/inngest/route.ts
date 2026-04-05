import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { executeWorkflow } from "@/inngest/functions";

const isInngestEnabled =
  process.env.INNGEST_EVENT_KEY &&
  process.env.INNGEST_EVENT_KEY !== "undefined" &&
  process.env.INNGEST_EVENT_KEY !== "";

// ✅ Only enable Inngest if key exists
export const { GET, POST, PUT } = isInngestEnabled
  ? serve({
    client: inngest,
    functions: [executeWorkflow],
  })
  : {
    GET: async () =>
      new Response("Inngest disabled", { status: 200 }),
    POST: async () =>
      new Response("Inngest disabled", { status: 200 }),
    PUT: async () =>
      new Response("Inngest disabled", { status: 200 }),
  };