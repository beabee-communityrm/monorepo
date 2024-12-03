import type {
  CalloutResponseAnswerAddress,
  CalloutResponseAnswerFileUpload,
} from "./index.js";

export type CalloutResponseAnswer =
  | string
  | boolean
  | number
  | Record<string, boolean>
  | CalloutResponseAnswerAddress
  | CalloutResponseAnswerFileUpload;
