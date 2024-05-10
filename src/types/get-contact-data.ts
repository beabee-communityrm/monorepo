import type { ContributionPeriod } from "../data/index.ts";
import type { ContactData, RoleType } from "./index.ts";

export interface GetContactData extends ContactData {
  id: string;
  joined: Date;
  lastSeen?: Date;
  contributionAmount?: number;
  contributionPeriod?: ContributionPeriod;
  activeRoles: RoleType[];
}
