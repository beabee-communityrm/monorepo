import { isCalloutInputSelectComponent } from "../utils/index.ts";
import type {
  CalloutComponentSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentSelectValidator: ValidatorCalloutComponent = (
  schema: CalloutComponentSchema,
  _answer: CalloutResponseAnswer,
): boolean => {
  if (!isCalloutInputSelectComponent(schema)) {
    throw new Error("Schema is not a select component");
  }
  throw new Error(`[calloutComponentSelectValidator] Not implemented yet`);
};
