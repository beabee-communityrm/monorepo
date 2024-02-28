import { CalloutResponseAnswer } from "../index.ts";
import type {
  CalloutComponentContentSchema,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentContentValidator: ValidatorCalloutComponent<
  CalloutComponentContentSchema
> = (
  _: CalloutComponentContentSchema,
  answer: CalloutResponseAnswer,
): boolean => {
  // Content components have no answer, so answer should be falsy
  return !answer;
};
