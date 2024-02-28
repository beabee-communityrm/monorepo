import type {
  CalloutComponentBaseSchema,
  CalloutResponseAnswer,
} from "./index.ts";

export type ValidatorCalloutComponent<
  S extends CalloutComponentBaseSchema,
  A = CalloutResponseAnswer,
> = (
  schema: S,
  answer: A,
) => boolean;
