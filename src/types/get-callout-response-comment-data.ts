import type { CalloutResponseCommentData, GetContactData } from "./index.ts";

export interface GetCalloutResponseCommentData
  extends CalloutResponseCommentData {
  contact: GetContactData;
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
