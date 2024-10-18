import type { Filters } from "../types/index.ts";
import {
  ContributionPeriod,
  ContributionType,
  NewsletterStatus,
} from "../data/index.ts";

export const RoleTypes = ["member", "admin", "superadmin"] as const;

type ContactFilters = Readonly<{
  id: { type: "contact" };
  firstname: { type: "text" };
  lastname: { type: "text" };
  email: { type: "text" };
  joined: { type: "date" };
  lastSeen: { type: "date" };
  contributionCancelled: { type: "date"; nullable: true };
  contributionType: { type: "enum"; options: readonly ContributionType[] };
  contributionMonthlyAmount: { type: "number" };
  contributionPeriod: { type: "enum"; options: readonly ContributionPeriod[] };
  deliveryOptIn: { type: "boolean" };
  newsletterStatus: { type: "enum"; options: readonly NewsletterStatus[] };
  newsletterGroups: { type: "array" };
  activePermission: { type: "enum"; options: typeof RoleTypes };
  activeMembership: { type: "boolean" };
  membershipStarts: { type: "date" };
  membershipExpires: { type: "date" };
  manualPaymentSource: { type: "text"; nullable: true };
  tags: { type: "array" };
}>;

export const contactFilters: ContactFilters = {
  id: {
    type: "contact",
  },
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
    nullable: true,
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
      NewsletterStatus.Pending,
      NewsletterStatus.None,
    ],
  },
  newsletterGroups: {
    type: "array",
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
  },
} as const satisfies Filters;

export type ContactFilterName = keyof typeof contactFilters;

type ContactCalloutFilters = Readonly<{
  hasAnswered: { type: "boolean" };
}>;

export const contactCalloutFilters: ContactCalloutFilters = {
  hasAnswered: {
    type: "boolean",
  },
} as const satisfies Filters;

export type ContactCalloutFilterName = keyof typeof contactCalloutFilters;
