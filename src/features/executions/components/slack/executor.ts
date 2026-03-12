import type { NodeExecutor } from "@/features/executions/types";
import HandleBars from "handlebars";
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import { discordChannel } from "@/inngest/channels/discord";
import ky from "ky";
import { slackChannel } from "@/inngest/channels/slack";
type SlackData = {
  variableName?: string;
  webhookurl?: string;
  content?: string;
};
HandleBars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);
  const safeString = new HandleBars.SafeString(stringified);
  return safeString;
});
export const slackExecutor: NodeExecutor<SlackData> = async ({
  nodeId,
  data,
  context,
  step,
  publish,
}) => {
  await publish(
    slackChannel().status({
      nodeId,
      status: "loading",
    }),
  );
  console.log("data",data);
  if (!data.content) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Slack node:content  is required");
  }

  const rawContent = HandleBars.compile(data.content)(context);
  const content = decode(rawContent);
 

  try {
    const result = await step.run("slack-webhook", async () => {
      if (!data.webhookurl) {
        await publish(
          slackChannel().status({
            nodeId,
            status: "error",
          }),
        );
        throw new NonRetriableError("Slack node: webhookUrl  is required");
      }
      await ky.post(data.webhookurl, {
        json: {
          content:content
        },
      });

      if (!data.variableName) {
        await publish(
          slackChannel().status({
            nodeId,
            status: "error",
          }),
        );
        throw new NonRetriableError("Slack node:Variable name is required");
      }
      return {
        ...context,
        [data.variableName]: {
          messageContent: content.slice(0, 2000),
        },
      };
    });

    await publish(
      slackChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return result;
  } catch (error) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
