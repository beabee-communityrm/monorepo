import type { UpdateCalloutResponseCommentData } from '@beabee/beabee-common';

export interface CalloutResponseCommentData
  extends UpdateCalloutResponseCommentData {
  responseId: string;
}
