export interface CreateUserArgs {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  membership: 'none' | 'permanent' | 'monthly' | 'expired';
  role: 'none' | 'admin' | 'superadmin';
}

export interface ListUserArgs {
  email?: string | undefined;
  withoutPassword?: boolean | undefined;
}

export interface DeleteUserArgs {
  email?: string | undefined;
  withoutPassword?: boolean | undefined;
  force?: boolean | undefined;
}
