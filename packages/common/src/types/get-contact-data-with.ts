import { GetContactWith } from "../index.ts";
import type {
  ContactProfileData,
  ContactRoleData,
  ContributionInfo,
  GetContactData,
  Noop,
} from "./index.ts";

export type GetContactDataWith<With extends GetContactWith> =
  & GetContactData
  & ("profile" extends With ? { profile: ContactProfileData } : Noop)
  & ("contribution" extends With ? { contribution: ContributionInfo } : Noop)
  & ("roles" extends With ? { roles: ContactRoleData[] } : Noop);
