import type {
  CalloutResponseAnswersSlide,
  CalloutResponseGuestData,
  CalloutResponseNewsletterData
} from "./index.js";

export interface CreateCalloutResponseData {
  answers: CalloutResponseAnswersSlide;
  guest?: CalloutResponseGuestData;
  newsletter?: CalloutResponseNewsletterData;
  bucket?: string;
  /** List of tags ids to add to the callout response */
  tags?: string[];
  assigneeId?: string | null;
}
