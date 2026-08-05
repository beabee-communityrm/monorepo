import { ActivityEventType, ContactOriginData } from '@beabee/beabee-common';

import { getRepository } from '#database';
import { log as mainLogger } from '#logging';
import { ActivityEvent } from '#models/index';

const log = mainLogger.child({ app: 'activity-service' });

class ActivityService {
  /**
   * Add new event to events table
   * @param event Event to add
   */
  async addEvent(
    event: Pick<
      ActivityEvent,
      'targetId' | 'actorId' | 'actorType' | 'eventType' | 'metadata'
    >
  ): Promise<void> {
    await getRepository(ActivityEvent).insert(event);
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
   * contact.created activity event
   * Source is the actor type and referrer and campaign are obtained from
   * the metadata
   * @param contactId The contact ID
   * @returns The contact's origin, or null if no creation event was recorded
   */
  async getContactOrigin(targetId: string): Promise<ContactOriginData | null> {
    const event = await getRepository(ActivityEvent).findOne({
      where: { targetId, eventType: ActivityEventType.ContactCreated },
    });

    // If event not found, return empty strings
    return {
      source: event ? event.actorType : '',
      referrer: event ? (event.metadata?.referrer ?? '') : '',
      campaign: event ? (event.metadata?.campaign ?? '') : '',
    };
  }
}

export const activityService = new ActivityService();
export default activityService;
