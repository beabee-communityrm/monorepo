import type { CalloutComponentType } from '../data/index.js';
import type {
  CalloutComponentBaseInputSchema,
  CalloutComponentInputNumberRules,
} from './index.js';

export interface CalloutComponentInputNumberSchema
  extends CalloutComponentBaseInputSchema {
  type: CalloutComponentType.INPUT_NUMBER;
  /** Placeholder for the form */
  placeholder?: string;
  /** `100` -> `100.00` if `true` */
  requireDecimal?: boolean;
  /** `3.14159265358979323846` -> `3.14159` if `decimalLimit === 5` */
  decimalLimit?: number;
  /** `10000000000` -> `10,000,000,000` if `true` */
  delimiter?: boolean;
  /** The default value for the form */
  defaultValue?: number | number[];
  /** The validation rules for the form */
  validate?: CalloutComponentInputNumberRules;
}
