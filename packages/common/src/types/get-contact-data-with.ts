import { GetContactWith } from '../index.js';
import type {
  ContactProfileData,
  ContactRoleData,
  ContributionInfo,
  GetContactData,
  Noop,
} from './index.js';

export type GetContactDataWith<With extends GetContactWith | void> =
  GetContactData &
    (GetContactWith.Profile extends With
      ? { profile: ContactProfileData }
      : Noop) &
    (GetContactWith.Contribution extends With
      ? { contribution: ContributionInfo }
      : Noop) &
    (GetContactWith.Roles extends With ? { roles: ContactRoleData[] } : Noop) &
    (GetContactWith.Tags extends With
      ? { tags: { id: string; name: string }[] }
      : Noop) &
    (GetContactWith.IsReviewer extends With ? { isReviewer: boolean } : Noop);
