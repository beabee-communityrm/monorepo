import type {
  ValidatedBooleanRule,
  ValidatedNumberRule,
  ValidatedStringRule,
} from "../types/index.ts";

export type ValidatedRule<Field extends string> =
  | ValidatedNumberRule<Field>
  | ValidatedStringRule<Field>
  | ValidatedBooleanRule<Field>;
