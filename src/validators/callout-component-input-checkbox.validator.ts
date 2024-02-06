import type {
  CalloutComponentInputCheckboxSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputCheckboxValidator: ValidatorCalloutComponent<
  CalloutComponentInputCheckboxSchema
> = (
  schema: CalloutComponentInputCheckboxSchema,
  answer: CalloutResponseAnswer,
): boolean => {
  if (schema.validate?.required && !answer) {
    return true;
  }

  return typeof answer === "boolean";
};
