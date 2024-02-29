import { isEmail } from "../utils/index.ts";

import type {
  CalloutComponentInputEmailSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputEmailValidator: ValidatorCalloutComponent<
  CalloutComponentInputEmailSchema
> = (
  _schema: CalloutComponentInputEmailSchema,
  answer: CalloutResponseAnswer | undefined,
): boolean => {
  return isEmail(answer);
};
