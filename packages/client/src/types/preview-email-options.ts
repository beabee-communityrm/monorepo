/**
 * Options for email preview requests
 */
export interface PreviewEmailOptions {
  /**
   * Optional contact ID to preview as (admin only).
   * When set, merge fields use this contact; otherwise the current user.
   */
  contactId?: string;
  /** Custom merge fields to use in the preview */
  mergeFields?: Record<string, string>;
  /** Optional subject to override the template's default subject */
  subject?: string;
  /**
   * Optional body to override the template's body for preview
   * When provided, this body will be used instead of the saved template body,
   * allowing preview of unsaved changes. Merge fields will still be replaced.
   */
  body?: string;
  /** Optional locale for the preview (defaults to system locale) */
  locale?: string;
}
