export interface GetOptionArgs {
  key?: string;
  all?: boolean;
}

export interface SetOptionArgs {
  key: string;
  value: string;
}

export interface DeleteOptionArgs {
  key: string;
}
