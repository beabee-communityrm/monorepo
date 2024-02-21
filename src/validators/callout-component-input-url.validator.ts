import { isURL } from "../utils/index.ts";

import type {
  CalloutComponentInputUrlSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputUrlValidator: ValidatorCalloutComponent<
  CalloutComponentInputUrlSchema
> = (
  _schema: CalloutComponentInputUrlSchema,
  answer: CalloutResponseAnswer,
): boolean => {
  return isURL(answer);
};
