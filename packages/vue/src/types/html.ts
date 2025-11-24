/**
 * Configuration options for HTML sanitization
 */
export interface SanitizeHtmlOptions {
  /**
   * Array of allowed HTML tags. If not provided, uses default safe tags.
   * @default DEFAULT_ALLOWED_HTML_TAGS
   */
  allowedTags?: string[];

  /**
   * Array of allowed HTML attributes. If not provided, uses default safe attributes.
   * @default DEFAULT_ALLOWED_HTML_ATTR
   */
  allowedAttr?: string[];

  /**
   * Whether to allow data attributes (data-*)
   * @default false
   */
  allowDataAttr?: boolean;
}
