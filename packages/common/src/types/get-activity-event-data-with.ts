import type { ActivityEventType, GetActivityEventWith } from '../data/index.js';
import type {
  ActivityEventReference,
  GetActivityEventData,
  Noop,
} from './index.js';

export type GetActivityEventDataWith<
  With extends GetActivityEventWith | void,
  T extends ActivityEventType = ActivityEventType,
> = GetActivityEventData<T> &
  (GetActivityEventWith.Actor extends With
    ? { actor: ActivityEventReference | null }
    : Noop) &
  (GetActivityEventWith.Target extends With
    ? { target: ActivityEventReference | null }
    : Noop);
