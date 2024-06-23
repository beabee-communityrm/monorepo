import type {
  ContactProfileData,
  ContactRoleData,
  ContributionInfo,
  GetContactData,
  GetContactWithType,
  Noop,
} from "./index.ts";

import type { GetContactWith } from "../data/index.ts";

export type GetContactDataWith<With extends GetContactWithType> =
  & GetContactData
  & (GetContactWith.Profile extends With ? { profile: ContactProfileData }
    : Noop)
  & (GetContactWith.Contribution extends With
    ? { contribution: ContributionInfo }
    : Noop)
  & (GetContactWith.Roles extends With ? { roles: ContactRoleData[] } : Noop);
