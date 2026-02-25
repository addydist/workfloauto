import type { NodeExecutor } from "@/features/executions/types";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import HandleBars from "handlebars";
import { generateText } from "ai";
import { geminiChannel } from "@/inngest/channels/gemini";
;
import { NonRetriableError } from "inngest";
type GeminiData = {
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
export const geminiExecutor: NodeExecutor<GeminiData> = async ({
  nodeId,
  data,
  context,
  step,
  publish,
}) => {
  await publish(
    geminiChannel().status({
      nodeId,
      status: "loading",
    })
  );
  if (!data.variableName) {
    await publish(
      geminiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Gemini node:Variable name is required");
  }
  if (!data.userPrompt) {
    await publish(
      geminiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Gemini node:User prompt  is required");
  }
  const systemPrompt = data.systemPrompt
    ? HandleBars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";
  const userPrompt = HandleBars.compile(data.userPrompt)(context);
  const credentials = process.env.GOOGLE_GENERATIVE_AI_API_KEY!;
  const google = createGoogleGenerativeAI({
    apiKey: credentials,
  });
  try {
    const { steps } = await step.ai.wrap("gemini-generate-text", generateText, {
      model: google(data.model || "gemini-2.5-flash"),
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
      geminiChannel().status({
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
      geminiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};
