// Shared, dependency-free definitions used by both the client dialog/node and
// the server-side executor. Keep this file free of server-only imports.

export const CONDITION_OPERATORS = [
  { value: "equals", label: "Equals (=)", unary: false },
  { value: "not_equals", label: "Not equals (≠)", unary: false },
  { value: "contains", label: "Contains", unary: false },
  { value: "not_contains", label: "Does not contain", unary: false },
  { value: "greater_than", label: "Greater than (>)", unary: false },
  { value: "less_than", label: "Less than (<)", unary: false },
  { value: "greater_or_equal", label: "Greater or equal (≥)", unary: false },
  { value: "less_or_equal", label: "Less or equal (≤)", unary: false },
  { value: "is_empty", label: "Is empty", unary: true },
  { value: "is_not_empty", label: "Is not empty", unary: true },
] as const;

export type ConditionOperator = (typeof CONDITION_OPERATORS)[number]["value"];

export const UNARY_OPERATORS: ConditionOperator[] = CONDITION_OPERATORS.filter(
  (op) => op.unary,
).map((op) => op.value);

export const isUnaryOperator = (operator: ConditionOperator): boolean =>
  UNARY_OPERATORS.includes(operator);

export type ConditionData = {
  leftValue?: string;
  operator?: ConditionOperator;
  rightValue?: string;
};
