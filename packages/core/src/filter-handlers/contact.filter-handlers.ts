import { Brackets } from "typeorm";

import { createQueryBuilder } from "@beabee/core/database";

import {
  CalloutResponse,
  ContactProfile,
  ContactRole,
  ContactContribution
} from "@beabee/core/models";
import { getFilterHandler } from "@beabee/core/utils/rules";

import { FilterHandler, FilterHandlers } from "@beabee/core/type";

import { contactTagFilterHandler } from "./tag.filter-handlers";

import { calloutResponseFilterHandlers } from "./callout-response.filter-handlers";

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
      .from(ContactRole, "cr")
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
      .from(ContactProfile, "profile")
      .where(convertToWhereClause(`profile.${field}`));

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
      .from(ContactContribution, "cc")
      .where(convertToWhereClause(`cc.${field}`));

    qb.where(`${fieldPrefix}id IN ${subQb.getQuery()}`);
  };
}

/**
 * Creates a filter handler for active permission-related fields
 * @param field - The field to filter on
 * @returns A filter handler function for the specified permission field
 */
const activePermission: FilterHandler = (qb, args) => {
  const roleType = args.field === "activeMembership" ? "member" : args.value[0];

  const isIn =
    args.field === "activeMembership"
      ? (args.value[0] as boolean)
      : args.operator === "equal";

  const subQb = createQueryBuilder()
    .subQuery()
    .select(`cr.contactId`)
    .from(ContactRole, "cr")
    .where(`cr.type = '${roleType}'`)
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
};

/**
 * Filter handler for callout-related queries
 * Supports filtering by:
 * - callout responses (callout.<id>.responses.<restFields>)
 * - whether a contact has answered a callout (callout.<id>.hasAnswered)
 */
const calloutsFilterHandler: FilterHandler = (qb, args) => {
  // Split out callouts.<id>.<filterName>[.<restFields...>]
  const [, calloutId, subField, ...restFields] = args.field.split(".");

  let params;

  switch (subField) {
    /**
     * Filter contacts by their responses to a callout, uses the same filters as
     * callout responses endpoints
     *
     * Filter field: callout.<id>.responses.<restFields>
     */
    case "responses": {
      const subQb = createQueryBuilder()
        .subQuery()
        .select("item.contactId")
        .from(CalloutResponse, "item");

      const responseField = restFields.join(".");
      const filterHandler = getFilterHandler(
        calloutResponseFilterHandlers,
        responseField
      );
      params = filterHandler(subQb, { ...args, field: responseField });

      subQb
        .andWhere(args.addParamSuffix("item.calloutId = :calloutId"))
        .andWhere("item.contactId IS NOT NULL");

      qb.where(`${args.fieldPrefix}id IN ${subQb.getQuery()}`);
      break;
    }

    /**
     * Filter contacts by whether they have answered a callout
     *
     * Filter field: callout.<id>.hasAnswered
     */
    case "hasAnswered": {
      const subQb = createQueryBuilder()
        .subQuery()
        .select("item.contactId")
        .from(CalloutResponse, "item")
        .where(args.addParamSuffix(`item.calloutId = :calloutId`))
        .andWhere("item.contactId IS NOT NULL");

      const operator = args.value[0] ? "IN" : "NOT IN";

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
 * - membershipStarts: Filters by membership start date
 * - membershipExpires: Filters by membership expiration date
 * - contributionCancelled: Filters by cancelled contributions
 * - manualPaymentSource: Filters by manual payment contributions
 * - callouts: Filters by callout responses and participation
 * - tags: Filters by contact tags
 */
export const contactFilterHandlers: FilterHandlers<string> = {
  deliveryOptIn: profileField("deliveryOptIn"),
  newsletterStatus: profileField("newsletterStatus"),
  newsletterGroups: profileField("newsletterGroups"),
  activePermission,
  activeMembership: activePermission,
  membershipStarts: membershipField("dateAdded"),
  membershipExpires: membershipField("dateExpires"),
  contributionCancelled: contributionField("cancelledAt"),
  manualPaymentSource: (qb, args) => {
    contributionField("mandateId")(qb, args);
    qb.andWhere(`${args.fieldPrefix}contributionType = 'Manual'`);
  },
  "callouts.": calloutsFilterHandler,
  tags: contactTagFilterHandler
};
