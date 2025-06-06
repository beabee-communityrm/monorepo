import type {
  CalloutComponentBaseSchema,
  CalloutResponseAnswer,
} from './index.js';

export type ValidatorCalloutComponent<
  S extends CalloutComponentBaseSchema,
  A = CalloutResponseAnswer,
> = (schema: S, answer: A) => boolean;
