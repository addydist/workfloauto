import type { NodeExecutor, NodeExecutorParams } from "@/features/executions/types";
import HandleBars from "handlebars";
import { conditionChannel } from "@/inngest/channels/condition";
import type { ConditionData, ConditionOperator } from "./constants";

HandleBars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);
  return new HandleBars.SafeString(stringified);
});

const resolve = (template: string | undefined, context: unknown): string =>
  HandleBars.compile(template ?? "")(context);

const toNumber = (value: string): number | null => {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

/**
 * Pure evaluation of a condition against the current workflow context.
 * `leftValue`/`rightValue` support handlebars templating like other nodes.
 */
export const evaluateCondition = (
  data: ConditionData,
  context: unknown,
): boolean => {
  const operator: ConditionOperator = data.operator ?? "equals";
  const left = resolve(data.leftValue, context);
  const right = resolve(data.rightValue, context);

  switch (operator) {
    case "equals":
      return left === right;
    case "not_equals":
      return left !== right;
    case "contains":
      return left.includes(right);
    case "not_contains":
      return !left.includes(right);
    case "is_empty":
      return left.trim() === "";
    case "is_not_empty":
      return left.trim() !== "";
    case "greater_than":
    case "less_than":
    case "greater_or_equal":
    case "less_or_equal": {
      const leftNum = toNumber(left);
      const rightNum = toNumber(right);
      // Fall back to lexicographic comparison when either side isn't numeric.
      const useString = leftNum === null || rightNum === null;
      const l: number | string = useString ? left : (leftNum as number);
      const r: number | string = useString ? right : (rightNum as number);
      if (operator === "greater_than") return l > r;
      if (operator === "less_than") return l < r;
      if (operator === "greater_or_equal") return l >= r;
      return l <= r;
    }
    default:
      return false;
  }
};

export type BranchResult = "true" | "false";

/**
 * Engine-facing runner for the condition node. Publishes realtime status,
 * evaluates the condition and reports which branch should be taken. The
 * workflow context is returned unchanged — a condition only gates flow.
 */
export const runConditionNode = async ({
  nodeId,
  data,
  context,
  step,
  publish,
}: NodeExecutorParams<ConditionData>): Promise<{
  context: NodeExecutorParams["context"];
  taken: BranchResult;
}> => {
  await publish(conditionChannel().status({ nodeId, status: "loading" }));

  try {
    const result = await step.run(`condition-${nodeId}`, async () =>
      evaluateCondition(data, context),
    );
    const taken: BranchResult = result ? "true" : "false";

    await publish(
      conditionChannel().status({ nodeId, status: "success", branch: taken }),
    );

    return { context, taken };
  } catch (error) {
    await publish(conditionChannel().status({ nodeId, status: "error" }));
    throw error;
  }
};

// Standard-signature executor so the type-complete registry is satisfied.
// The engine special-cases CONDITION and calls `runConditionNode` directly for
// branch info; this passthrough is a safe fallback that never alters context.
export const conditionExecutor: NodeExecutor<ConditionData> = async (params) => {
  const { context } = await runConditionNode(params);
  return context;
};
