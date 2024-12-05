import { isURL } from "../utils/index.js";

import type {
  CalloutComponentInputUrlSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent
} from "../types/index.js";

export const calloutComponentInputUrlValidator: ValidatorCalloutComponent<
  CalloutComponentInputUrlSchema
> = (
  _schema: CalloutComponentInputUrlSchema,
  answer: CalloutResponseAnswer
): boolean => {
  return isURL(answer);
};
