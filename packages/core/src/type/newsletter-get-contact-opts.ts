export interface NewsletterGetContactOpts {
  /** Fetch contacts updated after this date */
  startDate?: Date | undefined;
  /** Fetch contacts updated before this date */
  endDate?: Date | undefined;
}
