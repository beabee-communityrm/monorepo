import type {
  CalloutComponentInputSignatureSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputSignatureValidator: ValidatorCalloutComponent<
  CalloutComponentInputSignatureSchema
> = (
  _: CalloutComponentInputSignatureSchema,
  _answer: CalloutResponseAnswer,
): boolean => {
  throw new Error(
    `[calloutComponentInputSignatureValidator] Not implemented yet`,
  );
};
