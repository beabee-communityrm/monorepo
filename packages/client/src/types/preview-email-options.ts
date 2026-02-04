/**
 * Options for email preview requests.
 */
export interface PreviewEmailOptions {
  /** When set (admin), merge fields use this contact; otherwise the current user. */
  contactId?: string;
  /** Custom merge fields to use in the preview. */
  mergeFields?: Record<string, string>;
  /** Optional subject to override the template's default subject. */
  subject?: string;
  /** Optional body to override the template's body for preview. */
  body?: string;
  /** Optional locale for the preview. */
  locale?: string;
}
