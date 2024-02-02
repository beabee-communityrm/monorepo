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

  return isEmail(answer);
};
