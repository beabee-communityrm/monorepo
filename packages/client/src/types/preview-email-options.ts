/**
 * Options for email preview requests
 */
export interface PreviewEmailOptions {
  /** Custom merge fields to use in the preview */
  mergeFields?: Record<string, string>;
  /** Optional custom subject to override the template's default subject */
  customSubject?: string;
  /** Optional locale for the preview (defaults to system locale) */
  locale?: string;
}
