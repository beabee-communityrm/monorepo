import { isURL } from '../utils/index.js';

import type {
  CalloutComponentInputFileSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from '../types/index.js';
import { isFileUploadAnswer } from '../utils/callouts.js';

export const calloutComponentInputFileValidator: ValidatorCalloutComponent<
  CalloutComponentInputFileSchema
> = (
  _schema: CalloutComponentInputFileSchema,
  answer: CalloutResponseAnswer
): boolean => {
  // TODO: We just check the file URL at the moment, but we need to check the file size and type too

  if (isFileUploadAnswer(answer)) {
    return isURL(answer.url);
  }

  return false;
};
