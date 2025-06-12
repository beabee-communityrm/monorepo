import type { CalloutResponseCommentData, GetContactData } from './index.js';

export interface GetCalloutResponseCommentData
  extends CalloutResponseCommentData {
  contact: GetContactData;
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
