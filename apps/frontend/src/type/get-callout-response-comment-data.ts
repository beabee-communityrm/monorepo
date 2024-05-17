import type { CalloutResponseCommentData, GetContactData } from '@type';

export interface GetCalloutResponseCommentData
  extends CalloutResponseCommentData {
  contact: GetContactData;
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
