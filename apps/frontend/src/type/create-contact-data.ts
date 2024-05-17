import type {
  UpdateContactData,
  ContactRoleData,
  ForceUpdateContributionData,
} from '@type';

export interface CreateContactData extends UpdateContactData {
  email: string;
  firstname: string;
  lastname: string;
  roles?: ContactRoleData[];
  contribution?: ForceUpdateContributionData;
}
