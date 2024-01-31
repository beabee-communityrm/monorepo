import type {
  CalloutComponentBaseSchema,
  CalloutComponentTimeRules,
  CalloutComponentTimeType,
} from "./index.ts";

export interface CalloutComponentTimeSchema extends CalloutComponentBaseSchema {
  type: CalloutComponentTimeType;
  /** This is always true for input forms */
  input: true;
  /** E.g. 99:99 */
  inputMask: string;
  /** The validation rules for the form */
  validate?: CalloutComponentTimeRules;
}
