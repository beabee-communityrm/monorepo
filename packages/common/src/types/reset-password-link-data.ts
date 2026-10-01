/** Returned instead of sending the reset email when the caller has Operator Auth */
export interface ResetPasswordLinkData {
  resetUrl: string;
}
