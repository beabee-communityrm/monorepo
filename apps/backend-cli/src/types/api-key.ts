export interface CreateApiKeyArgs {
  email: string;
  description: string;
  expires: string;
}

export interface DeleteApiKeyArgs {
  id: string;
}
