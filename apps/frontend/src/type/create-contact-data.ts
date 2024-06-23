import type {
  UpdateContactData,
  ContactRoleData,
  ForceUpdateContributionData,
} from '@beabee/beabee-common';

export interface CreateContactData extends UpdateContactData {
  email: string;
  firstname: string;
  lastname: string;
  roles?: ContactRoleData[];
  contribution?: ForceUpdateContributionData;
}
