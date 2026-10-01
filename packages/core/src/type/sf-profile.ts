/**
 * A beabee_Profile__c record as returned by the REST/SOQL API. Only the fixed
 * fields are typed; org-specific newsletter fields (the config-driven
 * mappings) are accessed dynamically via the index signature.
 */
export interface SFProfileRecord {
  Id: string;
  CreatedDate?: string;
  beabeeID_bee__c: string;
  EMail_bee__c?: string | null;
  FirstName_bee__c?: string | null;
  LastName_bee__c?: string | null;
  [field: string]: unknown;
}

/** Salesforce OAuth2 token response. */
export interface SFTokenResponse {
  access_token: string;
  instance_url: string;
  token_type: string;
}
