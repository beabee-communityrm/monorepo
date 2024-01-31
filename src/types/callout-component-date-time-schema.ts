import type {
  CalloutComponentBaseSchema,
  CalloutComponentDateTimeRules,
  CalloutComponentDateTimeType,
  TextCase,
} from "./index.ts";

export interface CalloutComponentDateTimeSchema
  extends CalloutComponentBaseSchema {
  type: CalloutComponentDateTimeType;
  /** This is always true for input forms */
  input: true;
  /** Placeholder for the form */
  placeholder?: string;
  /** The text case for the form */
  case?: TextCase;
  /** If `true` multiple spaces will be truncated to a single space */
  truncateMultipleSpaces?: boolean;
  datePicker?: {
    disableWeekends: boolean;
    disableWeekdays: boolean;
    /** Unused property */
    [key: string]: unknown;
  };
  widget: {
    mode: "single";
    enableTime: boolean;
    /** E.g. "yyyy-MM-dd hh:mm a" */
    format: string;
    /** Unused property */
    [key: string]: unknown;
  };
  /** The validation rules for the form */
  validate?: CalloutComponentDateTimeRules;
}
