import {
  ActivityActorType,
  ActivityEventType,
  ContactOriginData,
} from '@beabee/beabee-common';

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

  private getContactAddedBy(event: ActivityEvent): string {
    switch (event.actorType) {
      case ActivityActorType.User:
      case ActivityActorType.ApiKey:
        return event.actorId ? 'admin' : 'self-signup'; // Admin ID != null implies the contact was added by admin
      case ActivityActorType.System:
      case ActivityActorType.Cron:
      case ActivityActorType.BackendCLI:
        return 'system';
      case ActivityActorType.Webhook:
        return 'webhook';
      default:
        return '';
    }
  }

  /**
   * Get the origin (source, referrer, campaign, added by) of a contact from
   * the corresponding contact.created event
   * @param contactId The contact ID
   * @returns The contact's origin, or null if no creation event was recorded
   */
  async getContactOrigin(targetId: string): Promise<ContactOriginData | null> {
    const event = await getRepository(ActivityEvent).findOne({
      where: { targetId, eventType: ActivityEventType.ContactCreated },
    });

    // If event not found, return empty strings
    return {
      source: event ? (event.metadata?.source ?? '') : '',
      medium: event ? (event.metadata?.medium ?? '') : '',
      campaign: event ? (event.metadata?.campaign ?? '') : '',
      addedBy: event ? this.getContactAddedBy(event) : '',
    };
  }
}

export const activityService = new ActivityService();
export default activityService;
