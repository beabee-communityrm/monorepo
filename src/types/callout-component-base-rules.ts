export interface CalloutComponentBaseRules {
  json?: string;
  custom?: string;
  /** Makes sure the data submitted for this field is unique, and has not been submitted before. */
  unique?: boolean;
  /** Allows multiple values to be entered for this field. */
  multiple?: boolean;
  /** A required field must be filled in before the form can be submitted. */
  required?: boolean;
  /** Error message displayed if any error occurred. */
  customMessage?: string;
  customPrivate?: boolean;
  strictDateValidation?: boolean;
}
