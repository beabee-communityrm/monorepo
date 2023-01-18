import type { Filters } from ".";
import {
  ContributionPeriod,
  ContributionType,
  NewsletterStatus,
  RoleTypes,
} from "../data";

export const contactFilters = {
  firstname: {
    type: "text",
  },
  lastname: {
    type: "text",
  },
  email: {
    type: "text",
  },
  joined: {
    type: "date",
  },
  lastSeen: {
    type: "date",
  },
  contributionCancelled: {
    type: "date",
  },
  contributionType: {
    type: "enum",
    options: [
      ContributionType.Automatic,
      ContributionType.Gift,
      ContributionType.Manual,
      ContributionType.None,
    ],
  },
  contributionMonthlyAmount: {
    type: "number",
  },
  contributionPeriod: {
    type: "enum",
    options: [ContributionPeriod.Monthly, ContributionPeriod.Annually],
  },
  deliveryOptIn: {
    type: "boolean",
  },
  newsletterStatus: {
    type: "enum",
    options: [
      NewsletterStatus.Subscribed,
      NewsletterStatus.Unsubscribed,
      NewsletterStatus.Cleaned,
      NewsletterStatus.None,
    ],
  },
  activePermission: {
    type: "enum",
    options: RoleTypes,
  },
  activeMembership: {
    type: "boolean",
  },
  membershipStarts: {
    type: "date",
  },
  membershipExpires: {
    type: "date",
  },
  manualPaymentSource: {
    type: "text",
    nullable: true,
  },
  tags: {
    type: "array",
    nullable: true,
  },
} satisfies Filters;

export type ContactFilterName = keyof typeof contactFilters;
