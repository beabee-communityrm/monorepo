import type { BaseValidatedRule } from "../types/index.ts";

export type ValidatedNumberRule<Field extends string> = BaseValidatedRule<
    "number",
    Field
>;
