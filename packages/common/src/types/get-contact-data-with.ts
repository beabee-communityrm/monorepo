import { GetContactWith } from "../index.ts";
import type {
  ContactProfileData,
  ContactRoleData,
  ContributionInfo,
  GetContactData,
  Noop,
} from "./index.ts";

export type GetContactDataWith<With extends GetContactWith | void> =
  & GetContactData
  & (GetContactWith.Profile extends With ? { profile: ContactProfileData }
    : Noop)
  & (GetContactWith.Contribution extends With
    ? { contribution: ContributionInfo }
    : Noop)
  & (GetContactWith.Roles extends With ? { roles: ContactRoleData[] } : Noop);
