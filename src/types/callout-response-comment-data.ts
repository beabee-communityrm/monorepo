import type { UpdateCalloutResponseCommentData } from "./index.ts";

export interface CalloutResponseCommentData
  extends UpdateCalloutResponseCommentData {
  responseId: string;
}
