export interface CalloutComponentBaseRules {
  /** A required field must be filled in before the form can be submitted. */
  required?: boolean;
  /** Probably unused property from [formio](https://github.com/beabee-communityrm/formio.js) */
  [key: string]: unknown;
}
