import {
  type ContactFilterName,
  ContributionPeriod,
  ContributionType,
  type GetCalloutDataWith,
  NewsletterStatus,
  contactCalloutFilters,
  contactFilters,
} from '@beabee/beabee-common';
import { type SelectItem } from '@beabee/vue';

import { type Ref, computed, ref, watchEffect } from 'vue';

import { i18n } from '#lib/i18n';
import { generalContent } from '#store';
import { client } from '#utils/api';

import type {
  FilterGroups,
  FilterItem,
  FilterItems,
} from '../../../../type/search';
import { withItems, withLabel } from '../../../../utils/filters';
import { useCalloutResponseFilters } from '../callout-responses.interface';
import CalloutResponseFilterGroup from './CalloutResponseFilterGroup.vue';

const { t } = i18n.global;

/**
 * Contact List Interface Module
 * Provides configuration and utilities for the contact list view
 */

/**
 * Filter Items Configuration
 * @description Defines all available filter options for contacts
 */
const filterItems = computed<FilterItems<ContactFilterName>>(() => ({
  // Contact Information Filters
  id: withLabel(contactFilters.id, t('common.id')),
  firstname: withLabel(contactFilters.firstname, t('contacts.data.firstname')),
  lastname: withLabel(contactFilters.lastname, t('contacts.data.lastname')),
  email: withLabel(contactFilters.email, t('contacts.data.email')),
  joined: withLabel(contactFilters.joined, t('contacts.data.joined')),
  lastSeen: withLabel(contactFilters.lastSeen, t('contacts.data.lastSeen')),

  // Newsletter Status Filters
  newsletterStatus: withLabel(
    contactFilters.newsletterStatus,
    t('contacts.data.newsletterStatus'),
    {
      [NewsletterStatus.Subscribed]: t('common.newsletterStatus.subscribed'),
      [NewsletterStatus.Unsubscribed]: t(
        'common.newsletterStatus.unsubscribed'
      ),
      [NewsletterStatus.Pending]: t('common.newsletterStatus.pending'),
      [NewsletterStatus.Cleaned]: t('common.newsletterStatus.cleaned'),
      [NewsletterStatus.None]: t('common.newsletterStatus.none'),
    }
  ),
  newsletterGroups: withLabel(
    contactFilters.newsletterGroups,
    t('contacts.data.newsletterGroups')
  ),

  // Tag and Delivery Filters
  tags: withLabel(contactFilters.tags, t('contacts.data.tags')),
  deliveryOptIn: withLabel(
    contactFilters.deliveryOptIn,
    t('contacts.data.deliveryOptIn')
  ),

  // Contribution Filters
  contributionCancelled: withLabel(
    contactFilters.contributionCancelled,
    t('contacts.data.contributionCancelled')
  ),
  contributionType: withLabel(
    contactFilters.contributionType,
    t('contacts.data.contributionType'),
    {
      [ContributionType.Automatic]: t('common.contributionType.automatic'),
      [ContributionType.Manual]: t('common.contributionType.manual'),
      [ContributionType.None]: t('common.contributionType.none'),
      [ContributionType.Gift]: t('common.contributionType.gift'),
    }
  ),
  contributionMonthlyAmount: withLabel(
    contactFilters.contributionMonthlyAmount,
    t('contacts.data.contributionMonthlyAmount'),
    { prefix: generalContent.value.currencySymbol }
  ),
  contributionPeriod: withLabel(
    contactFilters.contributionPeriod,
    t('contacts.data.contributionPeriod'),
    {
      [ContributionPeriod.Monthly]: t('common.contributionPeriod.monthly'),
      [ContributionPeriod.Annually]: t('common.contributionPeriod.annually'),
    }
  ),
  donationDate: withLabel(
    contactFilters.donationDate,
    t('contacts.data.donationDate')
  ),
  hasDonated: withLabel(
    contactFilters.hasDonated,
    t('contacts.data.hasDonated')
  ),
  totalDonationAmount: withLabel(
    contactFilters.totalDonationAmount,
    t('contacts.data.totalDonationAmount')
  ),
  averageDonationAmount: withLabel(
    contactFilters.averageDonationAmount,
    t('contacts.data.averageDonationAmount')
  ),
  manualPaymentSource: withLabel(
    contactFilters.manualPaymentSource,
    t('contacts.data.manualPaymentSource')
  ),

  // Role and Membership Filters
  activePermission: withLabel(
    contactFilters.activePermission,
    t('contacts.data.activePermission'),
    {
      member: t('common.role.member'),
      admin: t('common.role.admin'),
      superadmin: t('common.role.superadmin'),
    }
  ),
  activeMembership: withLabel(
    contactFilters.activeMembership,
    t('contacts.data.activeMembership')
  ),
  activeUser: withLabel(
    contactFilters.activeUser,
    t('contacts.data.activeUser')
  ),
  membershipStarts: withLabel(
    contactFilters.membershipStarts,
    t('contacts.data.membershipStarts')
  ),
  membershipExpires: withLabel(
    contactFilters.membershipExpires,
    t('contacts.data.membershipExpires')
  ),
}));

/**
 * Contact Filters Hook
 * @description Provides filter configuration and tag management for the contact list
 * @returns Filter groups and tag items for use in the contact list view
 */
export function useContactFilters() {
  const newsletterGroups = ref<{ id: string; label: string }[]>([]);
  (async () => {
    const data = await client.integrations.getNewsletter();
    newsletterGroups.value = data.provider !== 'none' ? data.groups : [];
  })();

  /**
   * Tag Management
   * @description Fetches and manages available contact tags
   */
  const tagItems = ref<SelectItem<string>[]>([]);
  async function refreshTags() {
    const tags = await client.contact.tag.list();
    // TODO: Use tag id
    tagItems.value = tags.map((tag) => ({ id: tag.id, label: tag.name }));
  }
  refreshTags();

  /**
   * Filter Groups Configuration
   * @description Organizes filters into logical groups
   */
  const filterGroups = computed<FilterGroups>(() => [
    {
      id: 'contact',
      label: t('contacts.dataGroup.contact'),
      items: {
        ...withItems(filterItems, [
          'firstname',
          'lastname',
          'email',
          'joined',
          'lastSeen',
          'newsletterStatus',
        ]),
        newsletterGroups: {
          ...filterItems.value.newsletterGroups,
          ...(newsletterGroups.value.length && {
            options: newsletterGroups.value,
          }),
        },
        tags: {
          ...filterItems.value.tags,
          ...(tagItems.value.length && {
            options: tagItems.value,
          }),
        },
        ...withItems(filterItems, ['deliveryOptIn']),
      },
    },
    {
      id: 'recurringContributions',
      label: t('contacts.dataGroup.recurringContributions'),
      items: withItems(filterItems, [
        'contributionType',
        'contributionMonthlyAmount',
        'contributionPeriod',
        'contributionCancelled',
        'manualPaymentSource',
      ]),
    },
    ...(generalContent.value.enableOneTimeDonations
      ? [
          {
            id: 'oneTimeContributions',
            label: t('contacts.dataGroup.oneTimeContributions'),
            items: withItems(filterItems, [
              'hasDonated',
              'donationDate',
              'totalDonationAmount',
              'averageDonationAmount',
            ]),
          },
        ]
      : []),
    {
      id: 'role',
      label: t('contacts.dataGroup.role'),
      items: withItems(filterItems, [
        'activePermission',
        'activeMembership',
        'activeUser',
        'membershipStarts',
        'membershipExpires',
      ]),
    },
    {
      id: 'callout',
      label: t('contacts.dataGroup.callout'),
      items: {},
      custom: CalloutResponseFilterGroup,
      itemsMatch: /^callouts\.[a-z0-9A-Z-]+\./,
    },
  ]);

  return { filterGroups, tagItems, refreshTags };
}

/** Prefix used for rule fields that filter on a crowdNewsroom response */
export const calloutFilterPrefix = 'callouts.';

/**
 * Extracts the crowdNewsroom id from a rule field, if it filters on one
 */
export function getCalloutIdFromField(field: string): string | undefined {
  return field.startsWith(calloutFilterPrefix)
    ? field.split('.')[1]
    : undefined;
}

/**
 * Crowd Newsroom Contact Filters Hook
 * @description Provides the filter items for a single crowdNewsroom, split into
 * the participation filter and the response sub-groups
 * @param calloutId - The crowdNewsroom to load filters for
 */
export function useCalloutContactFilters(calloutId: Ref<string | undefined>) {
  const callout = ref<GetCalloutDataWith<'form'>>();

  watchEffect(async () => {
    callout.value = calloutId.value
      ? await client.callout.get(calloutId.value, ['form'])
      : undefined;
  });

  const prefix = computed(() =>
    calloutId.value ? `${calloutFilterPrefix}${calloutId.value}.` : ''
  );

  const { filterGroups } = useCalloutResponseFilters(
    callout,
    computed(() => `${prefix.value}responses.`)
  );

  const participationItems = computed<FilterItems>(() =>
    calloutId.value
      ? {
          [`${prefix.value}hasAnswered`]: withLabel(
            contactCalloutFilters.hasAnswered,
            t('contacts.advancedSearch.hasAnswered')
          ),
        }
      : {}
  );

  /** Response information and response answer groups, empty until loaded */
  const groups = computed<FilterGroups>(() =>
    callout.value ? filterGroups.value : []
  );

  return { callout, participationItems, groups };
}

/**
 * Finds the filter item for a rule field across the given groups
 */
export function findFilterItem(
  groups: FilterGroups,
  field: string
): FilterItem | undefined {
  for (const group of groups) {
    if (group.items[field]) return group.items[field];
  }
}
