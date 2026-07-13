export interface CreateUserArgs {
  firstname: string;
  lastname: string;
  email: string;
  membership: 'none' | 'permanent' | 'monthly' | 'expired';
  role: 'none' | 'admin' | 'superadmin';
}

export interface ListUserArgs {
  email?: string | undefined;
  unlinked?: boolean | undefined;
}

export interface DeleteUserArgs {
  email?: string | undefined;
  unlinked?: boolean | undefined;
  force?: boolean | undefined;
}

export interface LinkUserArgs {
  csv?: string | undefined;
  fromIdp?: boolean | undefined;
}
