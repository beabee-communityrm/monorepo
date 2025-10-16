/**
 * Types for database commands
 */

export interface ExportDemoOptions {
  dryRun: boolean;
  type: 'json' | 'sql';
}

export interface ExportOptions {
  dryRun: boolean;
  type: 'json' | 'sql';
}

export interface ImportCalloutResponsesOptions {
  calloutSlug: string;
}

export interface ImportOptions {
  // No specific options, reads from stdin
}
