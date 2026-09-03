import {
  ActivityActor,
  ActivityEventType,
  ContactOriginData,
} from '@beabee/beabee-common';

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
  async addEvent<T extends ActivityEventType>(
    event: Pick<ActivityEvent<T>, 'targetId' | 'eventType' | 'metadata'> &
      Partial<ActivityActor>
  ): Promise<void> {
    try {
      log.info(
        `Added event of type ${event.eventType} for target ${event.targetId}`
      );
      await getRepository(ActivityEvent).insert({
        ...actorContext.get(),
        ...event,
      });
    } catch (err) {
      log.error(
        `Failed to log event ${event.eventType} for target ${event.targetId}`,
        err
      );
    }
  }

  /**
   * Add multiple events to the activity events table in a single batch insert
   * Event actor type and ID are obtained from the current request
   * @param events events containing contact ID, event type and metadata (if any)
   */
  async addEvents<T extends ActivityEventType>(
    events: (Pick<ActivityEvent<T>, 'targetId' | 'eventType' | 'metadata'> &
      Partial<ActivityActor>)[]
  ): Promise<void> {
    if (events.length === 0) return;
    try {
      log.info(`Added ${events.length} events`);
      const actor = actorContext.get();
      await getRepository(ActivityEvent).insert(
        events.map((event) => ({ ...actor, ...event }))
      );
    } catch (err) {
      log.error(`Failed to log ${events.length} events`, err);
    }
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

  /**
   * Get the origin (source, referrer, campaign) of a contact from their
   * contact.created event metadata
   * @param contactId The contact ID
   * @returns The contact's origin, or null if no creation event was recorded
   */
  async getContactOrigin(targetId: string): Promise<ContactOriginData | null> {
    const event = await getRepository<
      ActivityEvent<ActivityEventType.ContactCreated>
    >(ActivityEvent).findOne({
      where: { targetId, eventType: ActivityEventType.ContactCreated },
    });

    // If event not found, return empty strings
    return {
      source: event ? (event.metadata?.source ?? '') : '',
      medium: event ? (event.metadata?.medium ?? '') : '',
      campaign: event ? (event.metadata?.campaign ?? '') : '',
    };
  }
}

export const activityService = new ActivityService();
export default activityService;
