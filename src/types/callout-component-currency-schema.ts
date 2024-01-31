import type {
  CalloutComponentBaseSchema,
  CalloutComponentCurrencyRules,
  CalloutComponentCurrencyType,
  TextCase,
} from "./index.ts";

export interface CalloutComponentCurrencySchema
  extends CalloutComponentBaseSchema {
  type: CalloutComponentCurrencyType;
  /** This is always true for input forms */
  input: true;
  /** Placeholder for the form */
  placeholder?: string;
  /** The text case for the form */
  case: TextCase;
  /** If `true` multiple spaces will be truncated to a single space */
  truncateMultipleSpaces?: boolean;
  /** E.g. USD, EUR, GBP, etc. */
  currency: string;
  /** The validation rules for the form */
  validate?: CalloutComponentCurrencyRules;
}
