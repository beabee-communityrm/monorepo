import {
  ContributionPeriod,
  ContributionType,
  NewsletterStatus,
} from '../data/index.js';
import type { Filters } from '../types/index.js';
import type { TagFiltersType } from './tags.js';

export const RoleTypes = ['member', 'admin', 'superadmin'] as const;

export const contactFilters = {
  id: {
    type: 'contact',
  },
  firstname: {
    type: 'text',
  },
  lastname: {
    type: 'text',
  },
  email: {
    type: 'text',
  },
  joined: {
    type: 'date',
  },
  lastSeen: {
    type: 'date',
  },
  contributionCancelled: {
    type: 'date',
    nullable: true,
  },
  contributionType: {
    type: 'enum',
    options: [
      ContributionType.Automatic,
      ContributionType.Gift,
      ContributionType.Manual,
      ContributionType.None,
    ] satisfies ContributionType[] as ContributionType[],
  },
  contributionMonthlyAmount: {
    type: 'number',
  },
  contributionPeriod: {
    type: 'enum',
    options: [
      ContributionPeriod.Monthly,
      ContributionPeriod.Annually,
    ] satisfies ContributionPeriod[] as ContributionPeriod[],
  },
  donationDate: {
    type: 'date',
  },
  hasDonated: {
    type: 'boolean',
  },
  deliveryOptIn: {
    type: 'boolean',
  },
  newsletterStatus: {
    type: 'enum',
    options: [
      NewsletterStatus.Subscribed,
      NewsletterStatus.Unsubscribed,
      NewsletterStatus.Cleaned,
      NewsletterStatus.Pending,
      NewsletterStatus.None,
    ] satisfies NewsletterStatus[] as NewsletterStatus[],
  },
  newsletterGroups: {
    type: 'array',
  },
  activePermission: {
    type: 'enum',
    options: RoleTypes satisfies typeof RoleTypes as typeof RoleTypes,
  },
  activeMembership: {
    type: 'boolean',
  },
  activeUser: {
    type: 'boolean',
  },
  membershipStarts: {
    type: 'date',
  },
  membershipExpires: {
    type: 'date',
  },
  manualPaymentSource: {
    type: 'text',
    nullable: true,
  },
  tags: {
    type: 'array',
  },
} as const;
contactFilters satisfies Filters;

export type ContactFilterName = keyof typeof contactFilters;

export const contactTagFilters = {
  // ...tagFilters,
  id: {
    type: 'text',
  },
  name: {
    type: 'text',
  },
  description: {
    type: 'text',
  },
  contactId: {
    type: 'text',
  },
} as const;
contactTagFilters satisfies TagFiltersType & Filters;

export const contactCalloutFilters = {
  hasAnswered: {
    type: 'boolean',
  },
} as const;
contactCalloutFilters satisfies Filters;

export type ContactCalloutFilterName = keyof typeof contactCalloutFilters;
