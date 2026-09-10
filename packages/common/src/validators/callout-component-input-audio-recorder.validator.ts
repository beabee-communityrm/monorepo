import type {
  CalloutComponentInputAudioRecorderSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from '../types/index.js';
import { isFileUploadAnswer } from '../utils/callouts.js';
import { isURL } from '../utils/index.js';

export const calloutComponentInputAudioRecorderValidator: ValidatorCalloutComponent<
  CalloutComponentInputAudioRecorderSchema
> = (
  _schema: CalloutComponentInputAudioRecorderSchema,
  answer: CalloutResponseAnswer
): boolean => {
  // TODO: We just check the file URL at the moment, but we need to check the file size and type too

  if (isFileUploadAnswer(answer)) {
    return isURL(answer.url);
  }

  return false;
};
