import type {
  CalloutComponentBaseSchema,
  CalloutResponseAnswer,
} from "./index.ts";

export type ValidatorCalloutComponent<S extends CalloutComponentBaseSchema> = (
  schema: S,
  answer: CalloutResponseAnswer,
) => boolean;
