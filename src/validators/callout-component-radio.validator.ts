import { ValidatorCalloutInput } from "../types/index.ts";
import type {
  CalloutComponentSchema,
  CalloutResponseAnswer,
} from "../types/index.ts";

export const calloutComponentRadioValidator: ValidatorCalloutInput = (
  _schema: CalloutComponentSchema,
  _answer: CalloutResponseAnswer,
): boolean => {
  throw new Error(`[calloutComponentRadioValidator] Not implemented yet`);
};
