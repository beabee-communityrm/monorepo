/**
 * Options for email preview requests
 */
export interface PreviewEmailOptions {
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
