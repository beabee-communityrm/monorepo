/**
 * Options for email preview requests.
 */
export interface PreviewEmailOptions {
  /** When set (admin), merge fields use this contact; otherwise the current user. */
  contactId?: string;
  /** Custom merge fields for the preview. { FIELD_NAME: value }. */
  mergeFields?: Record<string, string>;
  /** Subject to use for the preview (overrides template default if provided). */
  subject?: string;
  /** Body to use for the preview (overrides template body; merge fields are still replaced). */
  body?: string;
  /** Locale for the preview (defaults to system locale if omitted). */
  locale?: string;
}
