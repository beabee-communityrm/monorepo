import { ValidatorCalloutInput } from "../types/index.ts";
import type {
  CalloutComponentSchema,
  CalloutResponseAnswer,
} from "../types/index.ts";

export const calloutComponentContentValidator: ValidatorCalloutInput = (
  _schema: CalloutComponentSchema,
  _answer: CalloutResponseAnswer,
): boolean => {
  throw new Error(`[calloutComponentContentValidator] Not implemented yet`);
};
