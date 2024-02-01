import type { CalloutComponentSchema, CalloutResponseAnswer } from "./index.ts";

export type ValidatorCalloutComponent = (
  schema: CalloutComponentSchema,
  answer: CalloutResponseAnswer,
) => boolean;
