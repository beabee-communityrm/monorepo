import { isCalloutInputSelectableComponent } from "../utils/index.ts";
import type {
  CalloutComponentSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputSelectableValidator:
  ValidatorCalloutComponent = (
    schema: CalloutComponentSchema,
    _answer: CalloutResponseAnswer,
  ): boolean => {
    if (!isCalloutInputSelectableComponent(schema)) {
      throw new Error("Schema is not a selectable component");
    }
    throw new Error(
      `[calloutComponentInputSelectableValidator] Not implemented yet`,
    );
  };
