import type {
  CalloutAccess,
  CalloutResponseMode,
  SetCalloutSlideSchema,
} from "@beabee/beabee-common";

export type CalloutSlide = Pick<SetCalloutSlideSchema, "id" | "components">;

export interface CreateCalloutOptions {
  access: CalloutAccess;
  responseMode: CalloutResponseMode;
  /** Defaults to one slide with one optional text question */
  slides?: CalloutSlide[];
  /** End date, which can be in the past to create it closed */
  expires?: Date | null;
  thanksRedirect?: string | null;
}
