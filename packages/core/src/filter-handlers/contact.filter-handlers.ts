import {
  ActivityActorType,
  ActivityEventType,
  type ContactAddedByType,
  ContactOriginData,
} from '@beabee/beabee-common';
import type { Address } from '@beabee/beabee-common';
import { createQueryBuilder } from '@beabee/core/database';
import {
  ActivityEvent,
  CalloutResponse,
  ContactContribution,
  ContactProfile,
  ContactRole,
  Payment,
} from '@beabee/core/models';
import { FilterHandler, FilterHandlers } from '@beabee/core/type';
import { getFilterHandler } from '@beabee/core/utils/rules';

import { Brackets } from 'typeorm';

import { calloutResponseFilterHandlers } from './callout-response.filter-handlers.js';
import { contactTagFilterHandler } from './tag.filter-handlers.js';

/**
 * @fileoverview Contact filter handlers for managing contact-related queries and filters
 * @module contact.filter-handlers
 */

/**
 * Creates a filter handler for membership-related fields
 * @param field - The field from ContactRole to filter on
 * @returns A filter handler function for the specified membership field
 */
function membershipField(field: keyof ContactRole): FilterHandler {
  return (qb, { fieldPrefix, convertToWhereClause }) => {
    const subQb = createQueryBuilder()
      .subQuery()
      .select(`cr.contactId`)
      .from(ContactRole, 'cr')
      .where(`cr.type = 'member'`)
      .andWhere(convertToWhereClause(`cr.${field}`));

    qb.where(`${fieldPrefix}id IN ${subQb.getQuery()}`);
  };
}

/**
 * Creates a filter handler for profile-related fields
 * @param field - The field from ContactProfile to filter on
 * @returns A filter handler function for the specified profile field
 */
function profileField(field: keyof ContactProfile): FilterHandler {
  return (qb, { fieldPrefix, convertToWhereClause }) => {
    const subQb = createQueryBuilder()
      .subQuery()
      .select(`profile.contactId`)
      .from(ContactProfile, 'profile')
      .where(convertToWhereClause(`profile.${field}`));

    qb.where(`${fieldPrefix}id IN ${subQb.getQuery()}`);
  };
}

/**
 * Creates a filter handler for a field inside the JSONB delivery address
 * @param field - The field from Address to filter on
 * @returns A filter handler function for the specified address field
 */
function deliveryAddressField(field: keyof Address): FilterHandler {
  return (qb, { fieldPrefix, convertToWhereClause }) => {
    const subQb = createQueryBuilder()
      .subQuery()
      .select(`profile.contactId`)
      .from(ContactProfile, 'profile')
      // Extract as text instead of JSONB (note ->> instead of ->)
      .where(convertToWhereClause(`profile.deliveryAddress ->> '${field}'`));

    qb.where(`${fieldPrefix}id IN ${subQb.getQuery()}`);
  };
}

/**
 * Creates a filter handler for contribution-related fields
 * @param field - The field from ContactContribution to filter on
 * @returns A filter handler function for the specified contribution field
 */
function contributionField(field: keyof ContactContribution): FilterHandler {
  return (qb, { fieldPrefix, convertToWhereClause }) => {
    const subQb = createQueryBuilder()
      .subQuery()
      .select(`cc.contactId`)
      .from(ContactContribution, 'cc')
      .where(convertToWhereClause(`cc.${field}`));

    qb.where(`${fieldPrefix}id IN ${subQb.getQuery()}`);
  };
}

/**
 * Creates a filter handler for one-time payment-related fields
 * @param field - The field from Payment to filter on
 * @returns A filter handler function for the specified payment field
 */
function oneTimePaymentField(field?: keyof Payment): FilterHandler {
  return (qb, { fieldPrefix, convertToWhereClause, value, operator }) => {
    const subQb = createQueryBuilder()
      .subQuery()
      .select('p.contactId')
      .from(Payment, 'p')
      .where("p.type = 'one-time'")
      .andWhere('p.subscriptionId IS NULL')
      .andWhere('p.contactId IS NOT NULL')
      .distinct(true);

    if (field) {
      subQb.andWhere(convertToWhereClause(`p.${field}`));
      qb.where(`${fieldPrefix}id IN ${subQb.getQuery()}`);
    } else {
      // Boolean check: has any successful payment or not
      const isIn = value[0] ? 'IN' : 'NOT IN';
      qb.where(`${fieldPrefix}id ${isIn} ${subQb.getQuery()}`);
    }
  };
}

/**
 * Creates a filter handler for one-time payment-statistics-related fields
 * @param statistic - The statistic to use to calculate the result
 * @returns A filter handler function for the specified payment field based on the statistics method
 */
function oneTimePaymentStatistic(statistic: 'avg' | 'total'): FilterHandler {
  return (qb, { fieldPrefix, convertToWhereClause }) => {
    const aggregateExpr =
      statistic === 'total' ? 'SUM(p.amount)' : 'AVG(p.amount)';

    const subQb = createQueryBuilder()
      .subQuery()
      .select('p.contactId')
      .from(Payment, 'p')
      .where("p.type = 'one-time'")
      .andWhere('p.subscriptionId IS NULL')
      .andWhere('p.contactId IS NOT NULL')
      .groupBy('p.contactId')
      .having(convertToWhereClause(aggregateExpr));

    qb.where(`${fieldPrefix}id IN ${subQb.getQuery()}`);
  };
}

/**
 * Creates a filter handler for active permission-related fields
 * @param field - The field to filter on
 * @returns A filter handler function for the specified permission field
 */
const activePermission: FilterHandler = (qb, args) => {
  const roleType = args.field === 'activeMembership' ? 'member' : args.value[0];

  const isIn =
    args.field === 'activeMembership'
      ? (args.value[0] as boolean)
      : args.operator === 'equal';

  const subQb = createQueryBuilder()
    .subQuery()
    .select(`cr.contactId`)
    .from(ContactRole, 'cr')
    .where(args.addParamSuffix('cr.type = :roleType'))
    .andWhere(`cr.dateAdded <= :now`)
    .andWhere(
      new Brackets((qb) => {
        qb.where(`cr.dateExpires IS NULL`).orWhere(`cr.dateExpires > :now`);
      })
    );

  if (isIn) {
    qb.where(`${args.fieldPrefix}id IN ${subQb.getQuery()}`);
  } else {
    qb.where(`${args.fieldPrefix}id NOT IN ${subQb.getQuery()}`);
  }

  return { roleType };
};

/**
 * Creates a filter handler for origin fields recorded on a contact's creation event
 * @param field - The field from the event metadata to filter on
 * @returns A filter handler function for the specified origin field
 */
function originField(field: keyof ContactOriginData): FilterHandler {
  return (qb, args) => {
    const subQb = createQueryBuilder()
      .subQuery()
      .select('ae.targetId')
      .from(ActivityEvent, 'ae')
      .where(args.addParamSuffix('ae.eventType = :eventType'))
      .andWhere(args.convertToWhereClause(`ae.metadata ->> '${field}'`));

    qb.where(`${args.fieldPrefix}id IN ${subQb.getQuery()}`);

    return { eventType: ActivityEventType.ContactCreated };
  };
}

/**
 * Filter handler for who added a contact, derived from the actor of their
 * creation event
 */
const addedByField: FilterHandler = (qb, args) => {
  // Define actor types
  const userActorTypes = `('${ActivityActorType.User}', '${ActivityActorType.ApiKey}')`;
  const systemActorTypes = `('${ActivityActorType.System}', '${ActivityActorType.Cron}', '${ActivityActorType.BackendCLI}')`;

  // Map addedBy to event actor type
  const addedByActorWhere: Record<ContactAddedByType, string> = {
    // Actor ID != null implies the contact was added by an admin
    admin: `ae.actorType IN ${userActorTypes} AND ae.actorId IS NOT NULL`,
    'self-signup': `ae.actorType IN ${userActorTypes} AND ae.actorId IS NULL`,
    system: `ae.actorType IN ${systemActorTypes}`,
    external: `ae.actorType = '${ActivityActorType.Webhook}'`,
  };

  // Query activity feed events to compute 'added by'
  const subQb = createQueryBuilder()
    .subQuery()
    .select('ae.targetId')
    .from(ActivityEvent, 'ae')
    .where(args.addParamSuffix('ae.eventType = :eventType'))
    .andWhere(addedByActorWhere[args.value[0] as ContactAddedByType]);

  const isIn = args.operator === 'equal' ? 'IN' : 'NOT IN';
  qb.where(`${args.fieldPrefix}id ${isIn} ${subQb.getQuery()}`);

  return { eventType: ActivityEventType.ContactCreated };
};

/**
 * Filter handler for callout-related queries
 * Supports filtering by:
 * - callout responses (callout.<id>.responses.<restFields>)
 * - whether a contact has answered a callout (callout.<id>.hasAnswered)
 */
const calloutsFilterHandler: FilterHandler = (qb, args) => {
  // Split out callouts.<id>.<filterName>[.<restFields...>]
  const [, calloutId, subField, ...restFields] = args.field.split('.');

  let params;

  switch (subField) {
    /**
     * Filter contacts by their responses to a callout, uses the same filters as
     * callout responses endpoints
     *
     * Filter field: callout.<id>.responses.<restFields>
     */
    case 'responses': {
      const subQb = createQueryBuilder()
        .subQuery()
        .select('response.contactId')
        .from(CalloutResponse, 'response');

      const responseField = restFields.join('.');
      const filterHandler = getFilterHandler(
        calloutResponseFilterHandlers,
        responseField
      );
      // Pass the subquery's alias as the field prefix, not the outer query's
      params = filterHandler(subQb, {
        ...args,
        fieldPrefix: 'response.',
        field: responseField,
      });

      subQb
        .andWhere(args.addParamSuffix('response.calloutId = :calloutId'))
        .andWhere('response.contactId IS NOT NULL');

      qb.where(`${args.fieldPrefix}id IN ${subQb.getQuery()}`);
      break;
    }

    /**
     * Filter contacts by whether they have answered a callout
     *
     * Filter field: callout.<id>.hasAnswered
     */
    case 'hasAnswered': {
      const subQb = createQueryBuilder()
        .subQuery()
        .select('response.contactId')
        .from(CalloutResponse, 'response')
        .where(args.addParamSuffix(`response.calloutId = :calloutId`))
        .andWhere('response.contactId IS NOT NULL');

      const operator = args.value[0] ? 'IN' : 'NOT IN';

      qb.where(`${args.fieldPrefix}id ${operator} ${subQb.getQuery()}`);
      break;
    }
  }

  return { calloutId, ...params };
};

/**
 * Collection of all contact-related filter handlers
 *
 * Available filters:
 * - deliveryOptIn: Filters by contact's delivery opt-in status
 * - newsletterStatus: Filters by newsletter subscription status
 * - newsletterGroups: Filters by newsletter group membership
 * - activePermission: Filters by active role permissions
 * - activeMembership: Filters by active membership status
 * - activeUser: Filters by whether user has set a password or not
 * - membershipStarts: Filters by membership start date
 * - membershipExpires: Filters by membership expiration date
 * - contributionCancelled: Filters by cancelled contributions
 * - manualPaymentSource: Filters by manual payment contributions
 * - callouts: Filters by callout responses and participation
 * - tags: Filters by contact tags
 * - campaign: Filters by the campaign (utm_campaign) a contact signed up through
 * - medium: Filters by the referrer (utm_medium) a contact signed up through
 * - source: Filters by the source (utm_source/callout) a contact signed up through
 * - addedBy: Filters by who added a contact
 * - organisation: Filters by organisation name
 * - deliveryAddressCountry: Filters by the delivery address country code
 */
export const contactFilterHandlers: FilterHandlers<string> = {
  deliveryOptIn: profileField('deliveryOptIn'),
  newsletterStatus: profileField('newsletterStatus'),
  newsletterGroups: profileField('newsletterGroups'),
  organisation: profileField('organisation'),
  deliveryAddressCountry: deliveryAddressField('country'),
  activePermission,
  activeMembership: activePermission,
  activeUser: (qb, args) => {
    qb.where(
      // Convert password.hash to simple boolean field for simpler querying
      args.convertToWhereClause(`(${args.fieldPrefix}password.hash <> '')`)
    );
  },
  membershipStarts: membershipField('dateAdded'),
  membershipExpires: membershipField('dateExpires'),
  contributionCancelled: contributionField('cancelledAt'),
  manualPaymentSource: (qb, args) => {
    contributionField('mandateId')(qb, args);
    qb.andWhere(`${args.fieldPrefix}contributionType = 'Manual'`);
  },
  'callouts.': calloutsFilterHandler,
  tags: contactTagFilterHandler,
  hasDonated: oneTimePaymentField(),
  donationDate: oneTimePaymentField('chargeDate'),
  totalDonationAmount: oneTimePaymentStatistic('total'),
  averageDonationAmount: oneTimePaymentStatistic('avg'),
  campaign: originField('campaign'),
  medium: originField('medium'),
  source: originField('source'),
  addedBy: addedByField,
};
