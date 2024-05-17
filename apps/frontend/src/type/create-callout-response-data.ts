import type { CalloutResponseAnswers } from '@beabee/beabee-common';

export interface CreateCalloutResponseData {
  guestName?: string;
  guestEmail?: string;
  answers: CalloutResponseAnswers;
  bucket?: string;
  tags?: string[];
  assigneeId?: string | null;
}
