import type { NodeExecutor } from "@/features/executions/types";
import { googleFromTriggerChannel } from "@/inngest/channels/google-form-trigger";

type GoogelFormTriggerData = Record<string, unknown>;

export const googleFormTriggerExecutor: NodeExecutor<GoogelFormTriggerData> = async ({
  nodeId,
  context,
  step,
  publish
}) => {
  await publish(
    googleFromTriggerChannel().status({
      nodeId,
      status: "loading",
    })
  );
  const result = await step.run(`google-form-trigger`, async () => context);
  await publish(
    googleFromTriggerChannel().status({
      nodeId,
      status: "success",
    })
  );

  return result;
};
