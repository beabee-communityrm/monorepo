import type { CalloutComponentSchema, CalloutResponseAnswer } from "./index.ts";

export type ValidatorCalloutNestable = (
  schema: CalloutComponentSchema,
  answerMap: Record<string, CalloutResponseAnswer | CalloutResponseAnswer[]>,
) => boolean;
