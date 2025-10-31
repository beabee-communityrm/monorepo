import type { Contact } from '#models/index';

/**
 * Email template definition with explicit metadata
 * This structure makes it easy to extract template information
 * without needing to analyze function signatures or JSDoc
 */
export interface EmailTemplateDefinition<TParams = any> {
  /**
   * Human-readable name of the template
   */
  name: string;

  /**
   * Description of when this template is used
   */
  description: string;

  /**
   * List of merge fields available in this template (excluding base contact fields)
   * Base contact fields (EMAIL, NAME, FNAME, LNAME) are automatically available for contact templates
   */
  mergeFields: string[];

  /**
   * Function that generates merge field values from parameters
   */
  generator: (contact: Contact, params: TParams) => Record<string, any>;
}

/**
 * General email template definition (no contact parameter)
 */
export interface GeneralEmailTemplateDefinition<TParams = any> {
  name: string;
  description: string;
  mergeFields: string[];
  generator: (params: TParams) => Record<string, any>;
}

/**
 * Helper type to extract the generator function from a template definition
 */
export type TemplateGenerator<T extends EmailTemplateDefinition<any>> =
  T['generator'];

/**
 * Helper type to extract the generator function from a general template definition
 */
export type GeneralTemplateGenerator<
  T extends GeneralEmailTemplateDefinition<any>,
> = T['generator'];
