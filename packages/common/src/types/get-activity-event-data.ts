import type { ActivityActorType, ActivityEventType } from '../data/index.js';
import type { ActivityEventMetadata } from './index.js';

export interface GetActivityEventData<
  T extends ActivityEventType = ActivityEventType,
> {
  id: string;
  targetId: string | null;
  createdAt: Date;
  eventType: T;
  actorType: ActivityActorType;
  actorId: string | null;
  metadata: ActivityEventMetadata<T> | null;
}
