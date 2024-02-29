import type {
  CalloutComponentInputCheckboxSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputCheckboxValidator: ValidatorCalloutComponent<
  CalloutComponentInputCheckboxSchema
> = (
  _schema: CalloutComponentInputCheckboxSchema,
  answer: CalloutResponseAnswer | undefined,
): boolean => {
  return typeof answer === "boolean";
};
