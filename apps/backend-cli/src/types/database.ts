export type AnonymizationLevel = 'full' | 'safe' | 'test' | 'none';

/**
 * Callout export has no ALWAYS_ANONYMIZED_MODELS — 'safe' would be
 * indistinguishable from 'full' and is deliberately excluded.
 */
export type CalloutAnonymizationLevel = 'full' | 'none';

export type DumpFormat = 'sql' | 'json';

export interface ResponseRow {
  [key: string]: string;
  contact_email?: string;
  guest_name?: string;
  guest_email?: string;
  bucket?: string;
  created_at?: string;
}

export interface ExportDatabaseArgs {
  dryRun: boolean;
  anonymize: AnonymizationLevel;
  skipAnonymizeTables: string[];
  preserveCalloutAnswers: boolean;
  format: DumpFormat;
}

export interface ExportCalloutsArgs {
  dryRun: boolean;
  anonymize: CalloutAnonymizationLevel;
  preserveCalloutAnswers: boolean;
  calloutSlug: string[];
}

export interface ExportDemoArgs {
  contactLimit: number;
  calloutLimit: number;
  dryRun: boolean;
}

export interface ImportDatabaseArgs {
  dryRun: boolean;
  format: DumpFormat;
}

export interface ImportCalloutResponsesArgs {
  slug: string;
  dryRun: boolean;
  failOnUnknown: boolean;
  dateFormat: string;
}
