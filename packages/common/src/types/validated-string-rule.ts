import type { BaseValidatedRule, FilterType } from "../types/index.js";

export type ValidatedStringRule<Field extends string> = BaseValidatedRule<
  Exclude<FilterType, "number" | "boolean">,
  Field
>;
