import { isCalloutInputSignatureComponent } from "../utils/index.ts";
import type {
  CalloutComponentSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputSignatureValidator:
  ValidatorCalloutComponent = (
    schema: CalloutComponentSchema,
    _answer: CalloutResponseAnswer,
  ): boolean => {
    if (!isCalloutInputSignatureComponent(schema)) {
      throw new Error("Schema is not a signature component");
    }

    throw new Error(
      `[calloutComponentInputSignatureValidator] Not implemented yet`,
    );
  };
