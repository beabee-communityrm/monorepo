import {
  type CalloutResponseFilterName,
  calloutResponseFilters,
} from '@beabee/beabee-common';
import { computed } from 'vue';
import i18n from '../../../lib/i18n';
import {
  type FilterGroup,
  type FilterItems,
  withLabel,
} from '../../search/search.interface';
import { type Header } from '../../table/table.interface';

const { t } = i18n.global;

export const headers = computed<Header[]>(() => [
  {
    value: 'number',
    text: t('calloutResponsesPage.response'),
    sortable: true,
  },
  {
    value: 'contact',
    text: t('calloutResponse.data.contact'),
  },
  {
    value: 'assignee',
    text: t('calloutResponse.data.assignee'),
  },
  {
    value: 'createdAt',
    text: t('calloutResponse.data.createdAt'),
    sortable: true,
    align: 'right',
  },
]);

export const filterGroups = computed<FilterGroup<CalloutResponseFilterName>[]>(
  () => [
    {
      label: t('calloutResponse.dataGroup.response'),
      items: ['createdAt', 'tags', 'answers'],
    },
  ]
);

export const filterItems = computed<FilterItems<CalloutResponseFilterName>>(
  () => ({
    id: withLabel(calloutResponseFilters.id, ''),
    calloutId: withLabel(
      calloutResponseFilters.calloutId,
      t('calloutResponse.data.callout')
    ),
    createdAt: withLabel(
      calloutResponseFilters.createdAt,
      t('calloutResponse.data.createdAt')
    ),
    updatedAt: withLabel(
      calloutResponseFilters.updatedAt,
      t('calloutResponse.data.updatedAt')
    ),
    bucket: withLabel(
      calloutResponseFilters.bucket,
      t('calloutResponse.data.bucket')
    ),
    tags: withLabel(
      calloutResponseFilters.tags,
      t('calloutResponse.data.tags')
    ),
    contact: withLabel(
      calloutResponseFilters.contact,
      t('calloutResponse.data.contact')
    ),
    assignee: withLabel(
      calloutResponseFilters.assignee,
      t('calloutResponse.data.assignee')
    ),
    answers: withLabel(
      calloutResponseFilters.answers,
      t('calloutResponse.data.answers')
    ),
  })
);
