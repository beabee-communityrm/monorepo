import type { BaseValidatedRule } from "../types/index.js";

export type ValidatedNumberRule<Field extends string> = BaseValidatedRule<
  "number",
  Field
>;
