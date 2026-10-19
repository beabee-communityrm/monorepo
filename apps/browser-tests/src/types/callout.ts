export interface CalloutSlide {
  id: string;
  /** Form.io components, as stored in the CrowdNewsroom's form schema */
  components: Record<string, unknown>[];
  /** Slide to go to next, if not the one after it */
  nextSlideId?: string;
}

export interface CreateCalloutOptions {
  access: "member" | "guest" | "anonymous" | "only-anonymous";
  responseMode: "single" | "single-editable" | "multiple";
  /** Defaults to one slide with one optional text question */
  slides?: CalloutSlide[];
  /** End date, which can be in the past to create it closed */
  expires?: Date | null;
  thanksRedirect?: string | null;
}

export interface CreateContactOptions {
  /** Whether the contact has an active member role. Defaults to true */
  member?: boolean;
}

export interface TestContact {
  id: string;
  email: string;
}
