import type {
  CalloutComponentInputTimeSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputTimeValidator: ValidatorCalloutComponent<
  CalloutComponentInputTimeSchema
> = (
  _schema: CalloutComponentInputTimeSchema,
  _answer: CalloutResponseAnswer | undefined,
): boolean => {
  throw new Error(
    `[calloutComponentInputTimeValidator] Not implemented yet`,
  );
};
