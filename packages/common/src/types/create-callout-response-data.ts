import type { CalloutResponseAnswersSlide } from "./index.js";

export interface CreateCalloutResponseData {
  guestName?: string;
  guestEmail?: string;
  answers: CalloutResponseAnswersSlide;
  bucket?: string;
  /** List of tags ids to add to the callout response */
  tags?: string[];
  assigneeId?: string | null;
}
