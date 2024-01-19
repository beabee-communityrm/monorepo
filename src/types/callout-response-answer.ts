import type {
  CalloutResponseAnswerAddress,
  CalloutResponseAnswerFileUpload,
} from "./index.ts";

export type CalloutResponseAnswer =
  | string
  | boolean
  | number
  | null
  | undefined
  | Record<string, boolean>
  | CalloutResponseAnswerAddress
  | CalloutResponseAnswerFileUpload;
