import { isCalloutInputEmailComponent, isEmail } from "../utils/index.ts";
import type {
  CalloutComponentSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputEmailValidator: ValidatorCalloutComponent = (
  schema: CalloutComponentSchema,
  answer: CalloutResponseAnswer,
): boolean => {
  if (!isCalloutInputEmailComponent(schema)) {
    throw new Error("Schema is not a email component");
  }

  // If answer is not required and is undefined return `true` because we don't need to validate this
  if (!schema.validate?.required && answer === undefined) {
    return true;
  }

  return isEmail(answer);
};
