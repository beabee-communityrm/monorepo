export interface ConfirmSignupResult {
  /** Where to send the member next, the setup page when null */
  postConfirmUrl: string | null;
  /** Set when the first payment still needs the member to authenticate it */
  paymentClientSecret?: string;
}
