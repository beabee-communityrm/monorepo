import type { CalloutComponentType } from "../data/index.js";
import type {
  CalloutComponentBaseRules,
  CalloutResponseAnswer
} from "./index.js";

export interface CalloutComponentBaseSchema {
  id: string;
  type: CalloutComponentType;
  key: string;
  label?: string;
  /** `true` if this is an input component */
  input?: boolean;
  /** `true` if the answer should only visible for admins */
  adminOnly?: boolean;
  /** Validation rules */
  validate?: CalloutComponentBaseRules;
  /** True if multiple responses / answers allowed */
  multiple?: boolean;
  /** If defined then this is the default value */
  defaultValue?: CalloutResponseAnswer | CalloutResponseAnswer[] | null;
  /** `true` if this component should be hidden */
  hidden?: boolean;
  /** Unused property */
  [key: string]: unknown;
}
