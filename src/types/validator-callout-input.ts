import type {
  CalloutComponentInputSchema,
  CalloutResponseAnswer,
} from "./index.ts";

export type ValidatorCalloutInput = (
  schema: CalloutComponentInputSchema,
  answer: CalloutResponseAnswer,
) => boolean;
