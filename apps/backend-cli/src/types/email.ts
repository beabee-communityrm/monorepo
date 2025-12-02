export interface ListEmailOverridesArgs {
  template?: string;
}

export interface CreateEmailOverrideArgs {
  template: string;
  subject: string;
  body: string;
  fromName?: string;
  fromEmail?: string;
  force?: boolean;
}

export interface DeleteEmailOverrideArgs {
  template: string;
  force?: boolean;
}
