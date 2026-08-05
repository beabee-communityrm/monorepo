import { ActivityEventType, ContactOriginData } from '@beabee/beabee-common';

import { InsertResult } from 'typeorm';

import { getRepository } from '#database';
import { ActivityEvent } from '#models/index';

class ActivityService {
  /**
   * Add new event to events table
   * @param event Event to add
   */
  async addEvent(
    event: Pick<
      ActivityEvent,
      'contactId' | 'actorId' | 'actorType' | 'eventType' | 'metadata'
    >
  ): Promise<InsertResult> {
    return await getRepository(ActivityEvent).insert(event);
  }

  /**
   * Get events for a particular contact
   * @param id The contact ID
   * @returns Events for this contact ID
   */
  async getEventByContactId(contactId: string): Promise<ActivityEvent[]> {
    return getRepository(ActivityEvent).findBy({ contactId });
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
  async getContactOrigin(contactId: string): Promise<ContactOriginData | null> {
    const event = await getRepository(ActivityEvent).findOne({
      where: { contactId, eventType: ActivityEventType.ContactCreated },
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
