import type { CalloutComponentSchema } from "./index.ts";

export type ValidatorCalloutComponent = (
  schema: CalloutComponentSchema,
  // deno-lint-ignore no-explicit-any
  answer: any,
) => boolean;
