import type { NodeExecutor } from "@/features/executions/types";
import { stripeTriggerChannel } from "@/inngest/channels/stipe-request";

type StipeTriggerData = Record<string, unknown>;

export const stripeTriggerExecutor: NodeExecutor<StipeTriggerData> = async ({
  nodeId,
  context,
  step,
  publish
}) => {
  await publish(
    stripeTriggerChannel().status({
      nodeId,
      status: "loading",
    })
  );
  const result = await step.run(`stripe-trigger-execution`, async () => context);
  await publish(
    stripeTriggerChannel().status({
      nodeId,
      status: "success",
    })
  );

  return result;
};
