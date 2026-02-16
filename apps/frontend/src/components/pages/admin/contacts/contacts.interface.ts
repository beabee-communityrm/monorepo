import {
  type ContactFilterName,
  type ContentJoinSetupData,
  ContributionPeriod,
  ContributionType,
  NewsletterStatus,
  contactFilters,
} from '@beabee/beabee-common';
import { type Header, type SelectItem } from '@beabee/vue';

import { computed, ref, watchEffect } from 'vue';

import { i18n } from '#lib/i18n';
import { generalContent } from '#store';
import { client } from '#utils/api';

import type { FilterGroups, FilterItems } from '../../../../type/search';
import { withItems, withLabel } from '../../../../utils/filters';
import CalloutResponseFilterGroup from './CalloutResponseFilterGroup.vue';

const { t } = i18n.global;

/**
 * Contact List Interface Module
 * Provides configuration and utilities for the contact list view
 */

/**
 * Table Headers Configuration
 * @description Defines the columns shown in the contacts table
 */
export const headers = computed<Header[]>(() => [
  {
    value: 'firstname',
    text: t('contacts.data.name'),
    sortable: true,
    width: '100%',
  },
  {
    value: 'email',
    text: t('contacts.data.email'),
    sortable: true,
  },
  {
    value: 'contributionMonthlyAmount',
    text: t('contacts.data.contribution'),
    align: 'right',
    sortable: true,
  },
  {
    value: 'joined',
    text: t('contacts.data.joined'),
    align: 'right',
    sortable: true,
  },
  {
    value: 'membershipStarts',
    text: t('contacts.data.membershipStarts'),
    align: 'right',
    sortable: true,
  },
]);

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
  /**
   * Newsletter setup content
   * @description Fetches and stores newsletter configuration
   */
  const setupContent = ref<ContentJoinSetupData | null>(null);
  (async () => {
    setupContent.value = await client.content.get('join/setup');
  })();

  /**
   * Tag Management
   * @description Fetches and manages available contact tags
   */
  const tagItems = ref<SelectItem<string>[]>([]);
  watchEffect(async () => {
    const tags = await client.contact.tag.list();
    // TODO: Use tag id
    tagItems.value = tags.map((tag) => ({ id: tag.id, label: tag.name }));
  });

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
          ...(setupContent.value?.newsletterGroups.length && {
            options: setupContent.value.newsletterGroups,
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

  return { filterGroups, tagItems };
}
