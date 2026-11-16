import {
  ActivityEventReference,
  ActivityFilterName,
  GetActivityEventWith,
  PaginatedQuery,
  Rule,
  activityFilters,
} from '@beabee/beabee-common';
import { getRepository } from '@beabee/core/database';
import {
  ActivityEvent,
  CalloutResponseSegment,
  CalloutVariant,
  Contact,
  Email,
  Segment,
} from '@beabee/core/models';
import { AuthInfo } from '@beabee/core/type';

import { TransformPlainToInstance } from 'class-transformer';
import { In } from 'typeorm';

import {
  GetActivityEventDto,
  GetActivityEventOptsDto,
  ListActivityEventsDto,
} from '#api/dto/ActivityFeedDto';
import { PaginatedDto } from '#api/dto/PaginatedDto';
import { BaseTransformer } from '#api/transformers/BaseTransformer';

// Loads the names of items by ID, keyed by the event type prefix of the events
// that target them. Event types with any other prefix have no target to load
const referenceLoaders: Record<
  string,
  (ids: string[]) => Promise<{ id: string; name: string }[]>
> = {
  contact: async (ids) => {
    const contacts = await getRepository(Contact).find({
      select: { id: true, firstname: true, lastname: true, email: true },
      where: { id: In(ids) },
    });
    return contacts.map((contact) => ({
      id: contact.id,
      name: contact.fullname || contact.email,
    }));
  },
  callout: async (ids) => {
    const variants = await getRepository(CalloutVariant).find({
      select: { calloutId: true, title: true },
      where: { calloutId: In(ids), name: 'default' },
    });
    return variants.map((variant) => ({
      id: variant.calloutId,
      name: variant.title,
    }));
  },
  'contact-segment': (ids) =>
    getRepository(Segment).find({
      select: { id: true, name: true },
      where: { id: In(ids) },
    }),
  'callout-response-segment': (ids) =>
    getRepository(CalloutResponseSegment).find({
      select: { id: true, name: true },
      where: { id: In(ids) },
    }),
  email: (ids) =>
    getRepository(Email).find({
      select: { id: true, name: true },
      where: { id: In(ids) },
    }),
};

function getTargetType(event: ActivityEvent): string {
  return event.eventType.split('.')[0];
}

class ActivityEventTransformer extends BaseTransformer<
  ActivityEvent,
  GetActivityEventDto,
  ActivityFilterName,
  GetActivityEventOptsDto
> {
  protected model = ActivityEvent;
  protected filters = activityFilters;

  @TransformPlainToInstance(GetActivityEventDto)
  convert(event: ActivityEvent): GetActivityEventDto {
    return {
      id: event.id,
      targetId: event.targetId,
      createdAt: event.createdAt,
      eventType: event.eventType,
      actorType: event.actorType,
      actorId: event.actorId,
      metadata: event.metadata,
      ...(event.actor !== undefined && { actor: event.actor }),
      ...(event.target !== undefined && { target: event.target }),
    };
  }

  protected async modifyItems(
    events: ActivityEvent[],
    query: ListActivityEventsDto,
    auth: AuthInfo
  ): Promise<void> {
    // Non-admins can see events about them, but not who else was involved
    if (!auth.roles.includes('admin')) return;

    const withActor = query.with?.includes(GetActivityEventWith.Actor);
    const withTarget = query.with?.includes(GetActivityEventWith.Target);

    // Group the IDs by type so each type is loaded with a single query
    const idsByType: Record<string, Set<string>> = {};
    for (const event of events) {
      // An actor ID is always a contact
      if (withActor && event.actorId) {
        (idsByType.contact ||= new Set()).add(event.actorId);
      }
      if (withTarget && event.targetId) {
        (idsByType[getTargetType(event)] ||= new Set()).add(event.targetId);
      }
    }

    const references = new Map<string, ActivityEventReference>();
    for (const [type, ids] of Object.entries(idsByType)) {
      const items = (await referenceLoaders[type]?.([...ids])) || [];
      for (const { id, name } of items) {
        references.set(`${type}:${id}`, { type, id, name });
      }
    }

    for (const event of events) {
      if (withActor) {
        event.actor = references.get(`contact:${event.actorId}`) || null;
      }
      if (withTarget) {
        event.target =
          references.get(`${getTargetType(event)}:${event.targetId}`) || null;
      }
    }
  }

  // Sort by created at unless asked otherwise
  protected transformQuery<T extends PaginatedQuery>(query: T): T {
    return {
      ...query,
      sort: query.sort || 'createdAt',
      order: query.order || 'DESC',
    };
  }

  // Non-admins only see events about them or caused by them
  protected async getNonAdminAuthRules(): Promise<Rule[]> {
    return [
      { field: 'targetId', operator: 'equal', value: ['me'] },
      { field: 'actorId', operator: 'equal', value: ['me'] },
    ];
  }

  /**
   * Fetch activity feed events for a target
   * @param auth Authentication info
   * @param targetId Target whose events are requested
   */
  async fetchByTargetId(
    auth: AuthInfo,
    targetId: string,
    query: ListActivityEventsDto
  ): Promise<PaginatedDto<GetActivityEventDto>> {
    return await this.fetch(auth, {
      ...query,
      rules: {
        condition: 'AND',
        rules: [
          ...(query.rules ? [query.rules] : []),
          { field: 'targetId', operator: 'equal', value: [targetId] },
        ],
      },
    });
  }

  /**
   * Fetch activity feed events caused by or about a contact
   * @param auth Authentication info
   * @param contactId Contact who is either the actor or the target
   */
  async fetchByContactId(
    auth: AuthInfo,
    contactId: string,
    query: ListActivityEventsDto
  ): Promise<PaginatedDto<GetActivityEventDto>> {
    return await this.fetch(auth, {
      ...query,
      rules: {
        condition: 'AND',
        rules: [
          ...(query.rules ? [query.rules] : []),
          {
            condition: 'OR',
            rules: [
              { field: 'targetId', operator: 'equal', value: [contactId] },
              { field: 'actorId', operator: 'equal', value: [contactId] },
            ],
          },
        ],
      },
    });
  }
}

export default new ActivityEventTransformer();
