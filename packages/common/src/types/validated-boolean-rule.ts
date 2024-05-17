import type { BaseValidatedRule } from "../types/index.ts";

export type ValidatedBooleanRule<Field extends string> = BaseValidatedRule<
  "boolean",
  Field
>;
