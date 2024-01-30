import type { CalloutComponentSchema, CalloutResponseAnswer } from "./index.ts";

export type ValidatorCallout = (
  schema: CalloutComponentSchema,
  answer: CalloutResponseAnswer,
) => boolean;
