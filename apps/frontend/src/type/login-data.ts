export interface LoginData {
  email: string;
  password: string;
  /** Optional multi factor authentication token */
  token?: string;
}
