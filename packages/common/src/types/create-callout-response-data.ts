import type { CalloutResponseAnswers } from "./index.ts";

export interface CreateCalloutResponseData {
  guestName?: string;
  guestEmail?: string;
  answers: CalloutResponseAnswers;
  bucket?: string;
  tags?: string[];
  assigneeId?: string | null;
}
