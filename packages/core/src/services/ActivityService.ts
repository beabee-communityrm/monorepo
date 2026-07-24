import { getRepository } from '#database';
import { ActivityEvent } from '#models/index';

class ActivityService {
  /**
   * Add new event to events table
   * @param event Event to add
   */
  async addEvent(event: ActivityEvent): Promise<void> {
    await getRepository(ActivityEvent).insert(event);
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
}

export const activityService = new ActivityService();
export default activityService;
