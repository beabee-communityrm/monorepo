export interface NewsletterFetchContactsOpts {
  updated?: {
    /** Fetch contacts updated after this date */
    since?: Date | undefined;
    /** Fetch contacts updated before this date */
    until?: Date | undefined;
  };
  emails?: string[] | undefined;
}
