import type { ContributionPeriod } from '../data/index.js';
import type { ContactData, RoleType } from './index.js';

export interface GetContactData extends ContactData {
  id: string;
  joined: Date;
  lastSeen?: Date;
  contributionAmount?: number;
  contributionPeriod?: ContributionPeriod;
  activeRoles: RoleType[];
  /** Identity provider subject, only present for admins when an IdP is configured */
  idpSubject?: string | null;
}
