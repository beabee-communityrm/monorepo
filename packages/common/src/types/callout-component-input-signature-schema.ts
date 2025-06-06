import type { CalloutComponentType } from '../data/index.js';
import type {
  CalloutComponentBaseInputSchema,
  CalloutComponentInputSignatureRules,
} from './index.js';

export interface CalloutComponentInputSignatureSchema
  extends CalloutComponentBaseInputSchema {
  type: CalloutComponentType.INPUT_SIGNATURE;
  /** The validation rules for the form */
  validate?: CalloutComponentInputSignatureRules;
}
