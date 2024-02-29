import type {
  CalloutComponentBaseSchema,
  CalloutResponseAnswer,
} from "./index.ts";

export type ValidatorCalloutComponent<
  S extends CalloutComponentBaseSchema,
  A = CalloutResponseAnswer | undefined,
> = (
  schema: S,
  answer: A,
) => boolean;
