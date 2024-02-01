import type {
  CalloutComponentNestableSchema,
  CalloutResponseAnswer,
} from "./index.ts";

export type ValidatorCalloutComponentNestable = (
  schema: CalloutComponentNestableSchema,
  answerMap: Record<string, CalloutResponseAnswer | CalloutResponseAnswer[]>,
) => boolean;
