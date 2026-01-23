import prisma from "@/lib/db";
import { inngest } from "./client";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
const google = createGoogleGenerativeAI();
export const execute = inngest.createFunction(
  { id: "execute-ai", retries: 2 },
  { event: "execute/ai" },
  async ({ event, step }) => {
    await step.sleep("pretend","5s");
    const { steps } = await step.ai.wrap("gemini-generate-text", generateText, {
      model: google("gemini-2.5-flash"),
      system:
        "You are a helpful assistant that helps to create workflows based on user email",
      prompt: "what is 10+10??",
    });
    return steps;
  }
);
