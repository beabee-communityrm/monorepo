import type {
  CalloutComponentNestableSchema,
  CalloutResponseAnswer,
} from "./index.ts";

export type ValidatorCalloutNestable = (
  schema: CalloutComponentNestableSchema,
  answerMap: Record<string, CalloutResponseAnswer | CalloutResponseAnswer[]>,
) => boolean;
