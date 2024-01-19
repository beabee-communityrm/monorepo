import type { BaseValidatedRule, FilterType } from "../types/index.ts";

export type ValidatedStringRule<Field extends string> = BaseValidatedRule<
  Exclude<FilterType, "number" | "boolean">,
  Field
>;
