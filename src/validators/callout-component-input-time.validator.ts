import { isCalloutInputTimeComponent } from "../utils/index.ts";
import type {
  CalloutComponentSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputTimeValidator: ValidatorCalloutComponent = (
  schema: CalloutComponentSchema,
  _answer: CalloutResponseAnswer,
): boolean => {
  if (!isCalloutInputTimeComponent(schema)) {
    throw new Error("Schema is not a time component");
  }
  throw new Error(
    `[calloutComponentInputTimeValidator] Not implemented yet`,
  );
};
