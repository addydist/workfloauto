import type { NodeExecutor } from "@/features/executions/types";
import { scheduleTriggerChannel } from "@/inngest/channels/schedule-trigger";

// A trigger node: it's the entry point, so it just marks itself running and
// passes the context through to downstream nodes.
export const scheduleTriggerExecutor: NodeExecutor = async ({
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(scheduleTriggerChannel().status({ nodeId, status: "loading" }));
  const result = await step.run(`schedule-trigger-${nodeId}`, async () => context);
  await publish(scheduleTriggerChannel().status({ nodeId, status: "success" }));
  return result;
};
