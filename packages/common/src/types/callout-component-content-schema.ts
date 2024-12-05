import type { CalloutComponentType } from "../data/index.js";
import type { CalloutComponentBaseSchema } from "./index.js";

/** A Callout content component only providing html content and accepts no answers. */
export interface CalloutComponentContentSchema
  extends CalloutComponentBaseSchema {
  type: CalloutComponentType.CONTENT;
  /** The html content of the callout component. */
  html: string;
  /** The label for this field that will appear next to it. */
  label: string;
  /** This is always false for content components. */
  input: false;
}
