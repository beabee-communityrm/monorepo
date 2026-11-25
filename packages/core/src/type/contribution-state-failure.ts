/** A contribution whose state could not be fetched, with the reason */
export interface ContributionStateFailure {
  contactId: string;
  error: unknown;
}
