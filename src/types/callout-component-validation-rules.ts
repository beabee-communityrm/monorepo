export interface CalloutComponentValidationRules {
  json?: string;
  custom?: string;
  /** Makes sure the data submitted for this field is unique, and has not been submitted before. */
  unique?: boolean;
  /** The regular expression pattern test that the field value must pass before the form can be submitted. */
  pattern?: string;
  /** The maximum amount of words that can be added to this field. */
  maxWords?: number;
  /** The minimum amount of words that can be added to this field. */
  minWords?: number;
  /** Allows multiple values to be entered for this field. */
  multiple?: boolean;
  /** A required field must be filled in before the form can be submitted. */
  required?: boolean;
  /** The minimum amount of words that can be added to this field. */
  maxLength?: number;
  /** The minimum length requirement this field must meet. */
  minLength?: number;
  /** Error message displayed if any error occurred. */
  customMessage?: string;
  customPrivate?: boolean;
  strictDateValidation?: boolean;
}
