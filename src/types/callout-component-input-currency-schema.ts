import type { CalloutComponentType } from "../data/index.ts";
import type {
  CalloutComponentBaseInputSchema,
  CalloutComponentInputCurrencyRules,
  TextCase,
} from "./index.ts";

export interface CalloutComponentInputCurrencySchema
  extends CalloutComponentBaseInputSchema {
  type: CalloutComponentType.INPUT_CURRENCY;
  /** Placeholder for the form */
  placeholder?: string;
  /** The text case for the form */
  case: TextCase;
  /** If `true` multiple spaces will be truncated to a single space */
  truncateMultipleSpaces?: boolean;
  /** E.g. USD, EUR, GBP, etc. */
  currency: string;
  /** The validation rules for the form */
  validate?: CalloutComponentInputCurrencyRules;
}
