import type { CalloutComponentType } from "../data/index.js";
import type {
  CalloutComponentBaseInputSchema,
  CalloutComponentInputCurrencyRules,
  TextCase,
} from "./index.js";

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
  /** The default value for the form */
  defaultValue?: number | number[];
  /** The validation rules for the form */
  validate?: CalloutComponentInputCurrencyRules;
}
