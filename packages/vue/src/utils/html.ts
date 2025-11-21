import DOMPurify from 'dompurify';

import {
  DEFAULT_ALLOWED_HTML_ATTR,
  DEFAULT_ALLOWED_HTML_TAGS,
} from '../constants';
import type { SanitizeHtmlOptions } from '../types/html';

/**
 * Sanitizes HTML content to prevent XSS attacks while preserving safe HTML elements.
 *
 * This function uses DOMPurify to sanitize HTML content before rendering with v-html.
 * It removes dangerous elements like `<script>` tags and event handlers while preserving
 * safe formatting elements.
 *
 * @param html - The HTML string to sanitize
 * @param options - Configuration options for sanitization
 * @returns Sanitized HTML string safe for rendering
 *
 * @example Basic usage (uses default safe tags and attributes)
 * ```ts
 * const safeHtml = sanitizeHtml(userInput);
 * ```
 *
 * @example Custom allowed tags and attributes
 * ```ts
 * const emailHtml = sanitizeHtml(emailBody, {
 *   allowedTags: [...DEFAULT_ALLOWED_HTML_TAGS, 'style'],
 *   allowedAttr: DEFAULT_ALLOWED_HTML_ATTR,
 *   allowDataAttr: true,
 * });
 * ```
 */
export function sanitizeHtml(
  html: string | null | undefined,
  options: SanitizeHtmlOptions = {}
): string {
  if (!html) {
    return '';
  }

  const {
    allowedTags = [...DEFAULT_ALLOWED_HTML_TAGS],
    allowedAttr = [...DEFAULT_ALLOWED_HTML_ATTR],
    allowDataAttr = false,
  } = options;

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttr,
    ALLOW_DATA_ATTR: allowDataAttr,
    ALLOW_UNKNOWN_PROTOCOLS: false,
  });
}
