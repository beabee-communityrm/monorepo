import type {
  CalloutAccess,
  CalloutComponentSchema,
  CalloutResponseMode,
} from "@beabee/beabee-common";

export interface CalloutSlide {
  id: string;
  components: CalloutComponentSchema[];
  /** Slide to go to next, if not the one after it */
  nextSlideId?: string;
}

export interface CreateCalloutOptions {
  access: CalloutAccess;
  responseMode: CalloutResponseMode;
  /** Defaults to one slide with one optional text question */
  slides?: CalloutSlide[];
  /** End date, which can be in the past to create it closed */
  expires?: Date | null;
  thanksRedirect?: string | null;
}
