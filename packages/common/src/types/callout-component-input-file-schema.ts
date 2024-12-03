import type { CalloutComponentType } from "../data/index.js";
import type {
  CalloutComponentBaseInputSchema,
  CalloutComponentInputFileRules
} from "./index.js";

export interface CalloutComponentInputFileSchema
  extends CalloutComponentBaseInputSchema {
  type: CalloutComponentType.INPUT_FILE;
  filePattern?: string;
  /** E.g. `"0KB"` */
  fileMinSize?: string;
  /** E.g. `"1GB"` */
  fileMaxSize?: string;
  /** E.g. `"200"` */
  imageSize?: string;
  /** The storage target for the uploaded file */
  storage?: string;
  /** If the file must be an image */
  image?: boolean;
  /** Allow the user to upload a file from their device's webcam */
  webcam?: boolean;
  validate?: CalloutComponentInputFileRules;
}
