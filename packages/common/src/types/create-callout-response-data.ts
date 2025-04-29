import { CreateCalloutResponseGuestData } from "./create-callout-response-guest-data.js";
import type { CalloutResponseAnswersSlide } from "./index.js";

export interface CreateCalloutResponseData {
  guest?: CreateCalloutResponseGuestData;
  answers: CalloutResponseAnswersSlide;
  bucket?: string;
  /** List of tags ids to add to the callout response */
  tags?: string[];
  assigneeId?: string | null;
}
