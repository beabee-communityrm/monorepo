export interface PaymentBulkFetchContributionsOpts {
  /** The contributions are those of specific contacts, not all of ours */
  partial: boolean;
  subscriptions: boolean;
  mandates: boolean;
  customers: boolean;
}

export interface PaymentBulkFetchPaymentsOpts {
  /** Only fetch these customers' payments, otherwise the whole account's */
  customerIds?: string[];
  since: Date | undefined;
  until: Date | undefined;
  /** Where to start when there is no `since` */
  oldest: Date;
}
