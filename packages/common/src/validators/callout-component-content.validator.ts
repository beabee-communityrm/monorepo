import type {
  CalloutComponentContentSchema,
  ValidatorCalloutComponent,
} from "../types/index.js";

export const calloutComponentContentValidator: ValidatorCalloutComponent<
  CalloutComponentContentSchema,
  unknown
> = (
  _: CalloutComponentContentSchema,
  answer: unknown,
): boolean => {
  // Content components have no answer, so answer should be falsy
  return !answer;
};
