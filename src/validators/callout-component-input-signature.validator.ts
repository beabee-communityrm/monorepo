import { isCalloutComponentOfType } from "../utils/index.ts";
import { CalloutComponentType } from "../data/index.ts";

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
    if (
      !isCalloutComponentOfType(schema, CalloutComponentType.INPUT_SIGNATURE)
    ) {
      throw new Error("Schema is not a signature component");
    }

    throw new Error(
      `[calloutComponentInputSignatureValidator] Not implemented yet`,
    );
  };
