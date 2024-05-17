import type {
  ContactRoleData,
  ForceUpdateContributionData,
  UpdateContactData,
} from "./index.ts";

export interface CreateContactData extends UpdateContactData {
  email: string;
  firstname: string;
  lastname: string;
  roles?: ContactRoleData[];
  contribution?: ForceUpdateContributionData;
}
