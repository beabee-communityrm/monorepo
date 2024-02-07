import { isURL } from "../utils/index.ts";

import type {
  CalloutComponentInputFileSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputFileValidator: ValidatorCalloutComponent<
  CalloutComponentInputFileSchema
> = (
  schema: CalloutComponentInputFileSchema,
  answer: CalloutResponseAnswer,
): boolean => {
  // If answer is not required and is undefined return true because we don't need to validate this
  if (!schema.validate?.required && answer === undefined) {
    return true;
  }

  // TODO: We just check the file URL at the moment, but we need to check the file size and type too

  return isURL(answer);
};
