import type { NodeExecutor } from "@/features/executions/types";
import HandleBars from "handlebars";
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import { discordChannel } from "@/inngest/channels/discord";
import ky from "ky";
type DiscordData = {
  variableName?: string;
  webhookurl?: string;
  content?: string;
  username?: string;
};
HandleBars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);
  const safeString = new HandleBars.SafeString(stringified);
  return safeString;
});
export const discordExecutor: NodeExecutor<DiscordData> = async ({
  nodeId,
  data,
  context,
  step,
  publish,
}) => {
  await publish(
    discordChannel().status({
      nodeId,
      status: "loading",
    }),
  );
  console.log("data",data);
  if (!data.content) {
    await publish(
      discordChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Discord node:content  is required");
  }

  const rawContent = HandleBars.compile(data.content)(context);
  const content = decode(rawContent);
  const username = data.username
    ? decode(HandleBars.compile(data.username)(context))
    : undefined;

  try {
    const result = await step.run("discord-webhook", async () => {
      if (!data.webhookurl) {
        await publish(
          discordChannel().status({
            nodeId,
            status: "error",
          }),
        );
        throw new NonRetriableError("Discord node: webhookUrl  is required");
      }
      await ky.post(data.webhookurl, {
        json: {
          content: content.slice(0, 2000),
          username,
        },
      });

      if (!data.variableName) {
        await publish(
          discordChannel().status({
            nodeId,
            status: "error",
          }),
        );
        throw new NonRetriableError("Discord node:Variable name is required");
      }
      return {
        ...context,
        [data.variableName]: {
          messageContent: content.slice(0, 2000),
        },
      };
    });

    await publish(
      discordChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return result;
  } catch (error) {
    await publish(
      discordChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
