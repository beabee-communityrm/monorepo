import type {
  CalloutComponentInputSignatureSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent
} from "../types/index.js";

export const calloutComponentInputSignatureValidator: ValidatorCalloutComponent<
  CalloutComponentInputSignatureSchema
> = (
  _: CalloutComponentInputSignatureSchema,
  _answer: CalloutResponseAnswer
): boolean => {
  throw new Error(
    `[calloutComponentInputSignatureValidator] Not implemented yet`
  );
};
