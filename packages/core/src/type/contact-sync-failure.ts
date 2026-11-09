/** A contact the external system refused, with the reason it gave */
export interface ContactSyncFailure {
  contactId: string;
  error: string;
}
