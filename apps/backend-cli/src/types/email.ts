export interface ListEmailOverridesArgs {
  template: string | undefined;
}

export interface CreateEmailOverrideArgs {
  template: string;
  subject: string;
  body: string;
  fromName: string | undefined;
  fromEmail: string | undefined;
  force: boolean | undefined;
}

export interface DeleteEmailOverrideArgs {
  template: string;
  force: boolean;
}
