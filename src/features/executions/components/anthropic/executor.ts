import type { NodeExecutor } from "@/features/executions/types";
import { createAnthropic } from "@ai-sdk/anthropic";
import HandleBars from "handlebars";
import { generateText } from "ai";

import { NonRetriableError } from "inngest";
import { anthropicChannel } from "@/inngest/channels/anthropic";
import prisma from "@/lib/db";
type AnthropicisData = {
  variableName?: string;
  credentialId?:string;
  systemPrompt?: string;
  userPrompt?: string;
};
HandleBars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);
  const safeString = new HandleBars.SafeString(stringified);
  return safeString;
});
export const anthropicExecutor: NodeExecutor<AnthropicisData> = async ({
  nodeId,
  data,
  context,
  userId,
  step,
  publish,
}) => {
  await publish(
    anthropicChannel().status({
      nodeId,
      status: "loading",
    })
  );
  if (!data.variableName) {
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Open ai node:Variable name is required");
  }
  if (!data.userPrompt) {
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Open ai node:User prompt  is required");
  }
  if (!data.credentialId) {
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Anthropic node:Credential  is required");
  }
  const systemPrompt = data.systemPrompt
    ? HandleBars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";
  const userPrompt = HandleBars.compile(data.userPrompt)(context);
  const credential=await step.run("get-credential",()=>{
    return prisma.credential.findUnique({
      where:{
        id:data.credentialId,
        userId
      }
    })
  })
  if(!credential){
    throw new NonRetriableError("Gemini node:Credential not found ");
  }
  const anthropic = createAnthropic({
    apiKey: credential.value,
  });
  try {
    const { steps } = await step.ai.wrap("anthropic-generate-text", generateText, {
      model: anthropic("claude-sonnet-4-6"),
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
      anthropicChannel().status({
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
      anthropicChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};
