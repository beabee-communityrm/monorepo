/**
 * Merge fields types for email templates
 *
 * Merge fields are placeholders in email templates (format: *|FIELD_NAME|*)
 * that get replaced with dynamic values at runtime.
 */

/**
 * Represents a single merge field tag
 */
export interface MergeTag {
  /**
   * The merge tag identifier (without delimiters)
   * @example 'FNAME', 'EMAIL', 'CALLOUTTITLE'
   */
  tag: string;

  /**
   * Optional i18n key for description
   * If not provided, defaults to 'mergeFields.tags.{tag}'
   * @example 'mergeFields.tags.FNAME'
   */
  descriptionKey?: string;

  /**
   * Optional example value for preview purposes
   * @example 'John', 'user@example.com'
   */
  example?: string;
}

/**
 * Represents a group of related merge fields
 */
export interface MergeTagGroup {
  /**
   * Unique identifier for the group
   * @example 'contact', 'magic', 'template'
   */
  key: string;

  /**
   * Optional i18n key for group label
   * If not provided, defaults to 'mergeFields.groups.{key}'
   * @example 'mergeFields.groups.contact'
   */
  labelKey?: string;

  /**
   * Merge tags belonging to this group
   */
  tags: MergeTag[];
}
