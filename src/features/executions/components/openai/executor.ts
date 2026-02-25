import type { NodeExecutor } from "@/features/executions/types";
import { createOpenAI } from "@ai-sdk/openai";
import HandleBars from "handlebars";
import { generateText } from "ai";

import { NonRetriableError } from "inngest";
import { openAiChannel } from "@/inngest/channels/openai";
type OpenAisData = {
  variableName?: string;
  model?:string;
  systemPrompt?: string;
  userPrompt?: string;
};
HandleBars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);
  const safeString = new HandleBars.SafeString(stringified);
  return safeString;
});
export const openAiExecutor: NodeExecutor<OpenAisData> = async ({
  nodeId,
  data,
  context,
  step,
  publish,
}) => {
  await publish(
    openAiChannel().status({
      nodeId,
      status: "loading",
    })
  );
  if (!data.variableName) {
    await publish(
      openAiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Open ai node:Variable name is required");
  }
  if (!data.userPrompt) {
    await publish(
      openAiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Open ai node:User prompt  is required");
  }
  const systemPrompt = data.systemPrompt
    ? HandleBars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";
  const userPrompt = HandleBars.compile(data.userPrompt)(context);
  const credentials = process.env.OPENAI_GENERATIVE_AI_API_KEY!;
  const openai = createOpenAI({
    apiKey: credentials,
  });
  try {
    const { steps } = await step.ai.wrap("openai-generate-text", generateText, {
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: userPrompt,
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });
    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";
    await publish(
      openAiChannel().status({
        nodeId,
        status: "success",
      })
    );
    return {
      ...context,
      [data.variableName]: {
         text,
      },
    };
  } catch (error) {
    await publish(
      openAiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};
