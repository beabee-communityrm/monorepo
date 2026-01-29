import { MCStatus } from './mc-status';

export interface MCMember {
  email_address: string;
  status: MCStatus;
  interests?: { [interest: string]: boolean };
  merge_fields: Record<string, string>;
  tags: { id: number; name: string }[];
  timestamp_opt?: string;
  timestamp_signup?: string;
  last_changed: string;
}

export interface MCMemberList {
  members: MCMember[];
  total_items: number;
}
