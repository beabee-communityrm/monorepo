import type { CalloutComponentType } from "../data/index.js";
import type {
  CalloutComponentBaseInputSchema,
  CalloutComponentInputDateTimeRules,
  TextCase,
} from "./index.js";

export interface CalloutComponentInputDateTimeSchema
  extends CalloutComponentBaseInputSchema {
  type: CalloutComponentType.INPUT_DATE_TIME;
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
    hourIncrement?: number;
    minuteIncrement?: number;
    /** E.g. "en" */
    locale: string;
    minDate: string | null;
    maxDate: string | null;
    disableWeekends: boolean;
    disableWeekdays: boolean;
    /** Unused property */
    [key: string]: unknown;
  };
  /** E.g. "2024-02-02T13:02:00+01:00" */
  defaultValue?: string | string[];
  enableMinDateInput: boolean;
  enableMaxDateInput: boolean;
  /** The validation rules for the form */
  validate?: CalloutComponentInputDateTimeRules;
}
