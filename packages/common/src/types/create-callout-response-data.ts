import type {
  CalloutResponseAnswersSlide,
  CreateCalloutResponseGuestData,
  CreateCalloutResponseNewsletterData
} from "./index.js";

export interface CreateCalloutResponseData {
  guest?: CreateCalloutResponseGuestData;
  newsletter?: CreateCalloutResponseNewsletterData;
  answers: CalloutResponseAnswersSlide;
  bucket?: string;
  /** List of tags ids to add to the callout response */
  tags?: string[];
  assigneeId?: string | null;
}
