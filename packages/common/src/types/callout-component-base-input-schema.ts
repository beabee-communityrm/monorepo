import type { CalloutComponentType } from "../data/index.js";
import type {
  CalloutComponentBaseRules,
  CalloutComponentBaseSchema
} from "./index.js";

export interface CalloutComponentBaseInputSchema
  extends CalloutComponentBaseSchema {
  type:
    | CalloutComponentType.INPUT_ADDRESS
    | CalloutComponentType.INPUT_CHECKBOX
    | CalloutComponentType.INPUT_CURRENCY
    | CalloutComponentType.INPUT_DATE_TIME
    | CalloutComponentType.INPUT_EMAIL
    | CalloutComponentType.INPUT_FILE
    | CalloutComponentType.INPUT_NUMBER
    | CalloutComponentType.INPUT_PHONE_NUMBER
    | CalloutComponentType.INPUT_SELECT
    | CalloutComponentType.INPUT_SELECTABLE_RADIO
    | CalloutComponentType.INPUT_SELECTABLE_SELECTBOXES
    | CalloutComponentType.INPUT_SIGNATURE
    | CalloutComponentType.INPUT_TEXT_AREA
    | CalloutComponentType.INPUT_TEXT_FIELD
    | CalloutComponentType.INPUT_TIME
    | CalloutComponentType.INPUT_URL;
  /** This is always true for input forms */
  input: true;
  /** The validation rules for input forms */
  validate?: CalloutComponentBaseRules;
  /** The description for the component */
  description?: string;
}
