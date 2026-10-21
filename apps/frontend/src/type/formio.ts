import type { GeocodingOptions as MapTilerGeocodingOptions } from '@maptiler/client';

/**
 * Base interface for all address provider options
 * Combines provider configuration and search options into a single interface
 */
export interface FormioAddressProviderOptions {
  params: {
    query?: string;
  };
}

/**
 * MapTiler provider configuration options
 */
export interface FormioMapTilerProviderOptions extends FormioAddressProviderOptions {
  params: MapTilerGeocodingOptions & {
    query?: string; // Search query
  };
}

/**
 * The context form.io hands to the `input/form` template when rendering a
 * field. Only the parts the template reads are declared here.
 */
export interface InputTemplateContext {
  instance: { id: string };
  component: {
    key: string;
    type?: string;
    description?: string;
    editor?: unknown;
    wysiwyg?: unknown;
    validate?: { required?: boolean };
    fields?: Record<string, { required?: boolean } | undefined>;
    showCharCount?: boolean;
    showWordCount?: boolean;
  };
  input: {
    type: string;
    ref?: string;
    attr?: Record<string, string>;
    content?: string;
  };
  prefix?: string | HTMLElement;
  suffix?: string | HTMLElement;
  hasValueMaskInput?: boolean;
  t: (value: string, options?: Record<string, unknown>) => string;
}
