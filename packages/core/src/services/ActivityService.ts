import { ActivityActor } from '@beabee/beabee-common';

import { InsertResult } from 'typeorm';

import { getRepository } from '#database';
import { actorContext } from '#lib/actor-context';
import { log as mainLogger } from '#logging';
import { ActivityEvent } from '#models/index';

const log = mainLogger.child({ app: 'activity-service' });

class ActivityService {
  /**
   * Add event to activity events table
   * Event actor type and ID are obtained from the current request
   * @param event event containing contact ID, event type and metadata (if any)
   */
  async addEvent(
    event: Pick<ActivityEvent, 'targetId' | 'eventType' | 'metadata'> &
      Partial<ActivityActor>
  ): Promise<InsertResult> {
    return await getRepository(ActivityEvent).insert({
      ...actorContext.get(),
      ...event,
    });
  }

  /**
   * Get events for a particular contact
   * @param id The contact ID
   * @returns Events for this contact ID
   */
  async getEventByContactId(targetId: string): Promise<ActivityEvent[]> {
    return getRepository(ActivityEvent).findBy({ targetId });
  }

  /**
   * Get all events from table
   */
  async getAllEvents(): Promise<ActivityEvent[]> {
    return getRepository(ActivityEvent).find();
  }
}

export const activityService = new ActivityService();
export default activityService;
