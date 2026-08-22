/**
 * A Salesforce Contact record as returned by the REST/SOQL API. Only the
 * standard fields we always read are typed; org-specific custom fields (the
 * config-driven newsletter fields) are accessed dynamically via the index
 * signature.
 */
export interface SFContactRecord {
  Id: string;
  Email?: string | null;
  FirstName?: string | null;
  LastName?: string | null;
  CreatedDate?: string;
  [field: string]: unknown;
}

/** Salesforce OAuth2 password-grant token response. */
export interface SFTokenResponse {
  access_token: string;
  instance_url: string;
  token_type: string;
}
