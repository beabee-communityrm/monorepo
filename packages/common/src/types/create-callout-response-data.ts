import type {
  CalloutResponseAnswersSlide,
  CalloutResponseGuestData,
  CalloutResponseNewsletterData
} from "./index.js";

export interface CreateCalloutResponseData {
  guest?: CalloutResponseGuestData;
  newsletter?: CalloutResponseNewsletterData;
  answers: CalloutResponseAnswersSlide;
  bucket?: string;
  /** List of tags ids to add to the callout response */
  tags?: string[];
  assigneeId?: string | null;
}
