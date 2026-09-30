export interface CreateApiKeyData {
  description: string;
  expires: Date | null;
  /** Contact to create the key for, only allowed with Operator Auth */
  contactId?: string;
}
