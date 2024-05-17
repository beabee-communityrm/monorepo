import {
  ContributionPeriod,
  NewsletterStatus,
  ContributionType,
  type ContactFilterName,
  contactFilters,
} from '@beabee/beabee-common';
import { computed } from 'vue';

import i18n from '../../../../lib/i18n';
import { generalContent } from '../../../../store';
import {
  type FilterGroup,
  type FilterItems,
  withLabel,
} from '../../../search/search.interface';
import { type Header } from '../../../table/table.interface';

const { t } = i18n.global;

export const headers = computed<Header[]>(() => [
  {
    value: 'firstname',
    text: t('contacts.data.name'),
    sortable: true,
    width: '100%',
  },
  { value: 'email', text: t('contacts.data.email'), sortable: true },
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

export const filterGroups = computed<FilterGroup<ContactFilterName>[]>(() => [
  {
    label: t('contacts.dataGroup.contact'),
    items: [
      'firstname',
      'lastname',
      'email',
      'joined',
      'lastSeen',
      'newsletterStatus',
      'tags',
      'deliveryOptIn',
    ],
  },
  {
    label: t('contacts.dataGroup.contribution'),
    items: [
      'contributionType',
      'contributionMonthlyAmount',
      'contributionPeriod',
      'contributionCancelled',
      'manualPaymentSource',
    ],
  },
  {
    label: t('contacts.dataGroup.role'),
    items: [
      'activePermission',
      'activeMembership',
      'membershipStarts',
      'membershipExpires',
    ],
  },
]);

export const filterItems = computed<FilterItems<ContactFilterName>>(() => ({
  id: withLabel(contactFilters.id, t('contacts.data.id')),
  firstname: withLabel(contactFilters.firstname, t('contacts.data.firstname')),
  lastname: withLabel(contactFilters.lastname, t('contacts.data.lastname')),
  email: withLabel(contactFilters.email, t('contacts.data.email')),
  joined: withLabel(contactFilters.joined, t('contacts.data.joined')),
  lastSeen: withLabel(contactFilters.lastSeen, t('contacts.data.lastSeen')),
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
  tags: withLabel(contactFilters.tags, t('contacts.data.tags')),
  deliveryOptIn: withLabel(
    contactFilters.deliveryOptIn,
    t('contacts.data.deliveryOptIn')
  ),
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
  manualPaymentSource: withLabel(
    contactFilters.manualPaymentSource,
    t('contacts.data.manualPaymentSource')
  ),
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
  membershipStarts: withLabel(
    contactFilters.membershipStarts,
    t('contacts.data.membershipStarts')
  ),
  membershipExpires: withLabel(
    contactFilters.membershipExpires,
    t('contacts.data.membershipExpires')
  ),
}));
