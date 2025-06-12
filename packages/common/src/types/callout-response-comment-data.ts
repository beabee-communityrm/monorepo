import type { UpdateCalloutResponseCommentData } from './index.js';

export interface CalloutResponseCommentData
  extends UpdateCalloutResponseCommentData {
  responseId: string;
}
