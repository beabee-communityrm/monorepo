export type AnonymizationLevel = 'full' | 'safe' | 'none';

/**
 * Callout export has no ALWAYS_ANONYMIZED_MODELS — 'safe' would be
 * indistinguishable from 'full' and is deliberately excluded.
 */
export type CalloutAnonymizationLevel = Extract<
  AnonymizationLevel,
  'full' | 'none'
>;

export interface ResponseRow {
  [key: string]: string;
  contact_email?: string;
  guest_name?: string;
  guest_email?: string;
  bucket?: string;
  created_at?: string;
}

export interface ImportCalloutResponsesArgs {
  slug: string;
  file?: string;
  dryRun: boolean;
  failOnUnknown: boolean;
  dateFormat: string;
}
