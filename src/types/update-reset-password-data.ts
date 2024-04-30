export interface UpdateResetPasswordData {
  password: string;
  /** If MFA is enabled, we need to provide the token */
  token?: string;
}
