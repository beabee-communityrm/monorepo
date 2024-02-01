import { ValidatorCalloutInput } from "../types/index.ts";
import type {
  CalloutComponentSchema,
  CalloutResponseAnswer,
} from "../types/index.ts";

export const calloutComponentSelectValidator: ValidatorCalloutInput = (
  _schema: CalloutComponentSchema,
  _answer: CalloutResponseAnswer,
): boolean => {
  throw new Error(`[calloutComponentSelectValidator] Not implemented yet`);
};
