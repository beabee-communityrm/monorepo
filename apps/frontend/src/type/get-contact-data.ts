import type {
  ContributionPeriod,
  RoleType,
  ContactData,
} from '@beabee/beabee-common';

export interface GetContactData extends ContactData {
  id: string;
  joined: Date;
  lastSeen?: Date;
  contributionAmount?: number;
  contributionPeriod?: ContributionPeriod;
  activeRoles: RoleType[];
}
