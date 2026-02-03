/** Options for email preview requests. */
export interface PreviewEmailOptions {
  /** When set (admin), merge fields use this contact; else current user. */
  contactId?: string;
  mergeFields?: Record<string, string>;
  subject?: string;
  body?: string;
  locale?: string;
}
