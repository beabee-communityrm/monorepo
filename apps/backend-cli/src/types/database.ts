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
