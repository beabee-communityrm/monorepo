/**
 * Sort type enumeration
 */
export enum SortType {
  Desc = 'DESC',
  Asc = 'ASC',
}

/**
 * Default allowed HTML tags for sanitization
 * Safe formatting elements that are commonly used in content
 */
export const DEFAULT_ALLOWED_HTML_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'u',
  's',
  'a',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'blockquote',
  'pre',
  'code',
  'span',
  'div',
  'img',
] as const;

/**
 * Default allowed HTML attributes for sanitization
 * Safe attributes that are commonly used in content
 */
export const DEFAULT_ALLOWED_HTML_ATTR = [
  'href',
  'src',
  'alt',
  'title',
  'class',
  'id',
  'style',
  'width',
  'height',
  'target',
  'rel',
] as const;
