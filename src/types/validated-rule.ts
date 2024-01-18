import type { ValidatedNumberRule, ValidatedStringRule, ValidatedBooleanRule } from "../types/index.ts";

export type ValidatedRule<Field extends string> =
    | ValidatedNumberRule<Field>
    | ValidatedStringRule<Field>
    | ValidatedBooleanRule<Field>;