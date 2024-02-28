import { isURL } from "../utils/index.ts";

import type {
  CalloutComponentInputFileSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";
import { isFileUploadAnswer } from "../utils/callouts.ts";

export const calloutComponentInputFileValidator: ValidatorCalloutComponent<
  CalloutComponentInputFileSchema
> = (
  _schema: CalloutComponentInputFileSchema,
  answer: CalloutResponseAnswer,
): boolean => {
  // TODO: We just check the file URL at the moment, but we need to check the file size and type too

  if (isFileUploadAnswer(answer)) {
    return isURL(answer.url);
  }

  return false;
};
