import type {
  CalloutResponseAnswerAddress,
  CalloutResponseAnswerFileUpload,
} from "./index.ts";

export type CalloutResponseAnswer =
  | string
  | boolean
  | number
  | Record<string, boolean>
  | CalloutResponseAnswerAddress
  | CalloutResponseAnswerFileUpload;
