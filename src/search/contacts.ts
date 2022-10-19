import {
  ContributionPeriod,
  ContributionType,
  NewsletterStatus,
} from "../data";

export const contactFilterNames = [
  "firstname",
  "lastname",
  "email",
  "joined",
  "contributionType",
  "contributionMonthlyAmount",
  "contributionPeriod",
  "deliveryOptIn",
  "newsletterStatus",
  "activePermission",
  "activeMembership",
  "membershipStarts",
  "membershipExpires",
  "manualPaymentSource",
  "tags",
] as const;

export type ContactFilterName = typeof contactFilterNames[number];

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
    options: ["member", "admin", "superadmin"],
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
} as const;
