import type { CalloutComponentBaseSchema } from "./index.ts";

export type ValidatorCalloutComponent<S extends CalloutComponentBaseSchema> = (
  schema: S,
  // deno-lint-ignore no-explicit-any
  answer: any,
) => boolean;
