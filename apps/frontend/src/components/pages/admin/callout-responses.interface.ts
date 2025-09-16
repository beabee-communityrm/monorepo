import {
  type CalloutResponseFilterName,
  type GetCalloutDataWith,
  calloutResponseFilters,
  getCalloutComponents,
} from '@beabee/beabee-common';
import type { Header } from '@beabee/vue';
import type { SelectItem } from '@beabee/vue/types';

import env from '@env';
import { i18n } from '@lib/i18n';
import { client } from '@utils/api';
import { buckets, convertComponentsToFilters } from '@utils/callouts';
import { type Ref, computed, ref, watchEffect } from 'vue';

import { type FilterGroups, type FilterItems } from '../../../type/search';
import { withLabel } from '../../../utils/filters';

const { t } = i18n.global;

/**
 * Callout Response Interface Module
 * Provides configuration and utilities for the callout response view
 */

/**
 * Table Headers Configuration
 * @description Defines the columns shown in the callout responses table
 */
export const headers = computed<Header[]>(() => [
  {
    value: 'number',
    text: t('calloutResponsesPage.response'),
    sortable: true,
  },
  // Conditionally show contact column based on environment
  ...(env.cnrMode
    ? []
    : [
        {
          value: 'contact',
          text: t('calloutResponse.data.contact'),
        },
      ]),
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

/**
 * Filter Items Configuration
 * @description Defines all available filter options for callout responses
 */
const filterItems = computed<FilterItems<CalloutResponseFilterName>>(() => ({
  // Response Identification Filters
  id: withLabel(calloutResponseFilters.id, ''),
  calloutId: withLabel(
    calloutResponseFilters.calloutId,
    t('calloutResponse.data.callout')
  ),

  // Timestamp Filters
  createdAt: withLabel(
    calloutResponseFilters.createdAt,
    t('calloutResponse.data.createdAt')
  ),
  updatedAt: withLabel(
    calloutResponseFilters.updatedAt,
    t('calloutResponse.data.updatedAt')
  ),

  // Organization Filters
  bucket: withLabel(
    calloutResponseFilters.bucket,
    t('calloutResponse.data.bucket')
  ),
  tags: withLabel(calloutResponseFilters.tags, t('calloutResponse.data.tags')),

  // User Association Filters
  contact: withLabel(
    calloutResponseFilters.contact,
    t('calloutResponse.data.contact')
  ),
  assignee: withLabel(
    calloutResponseFilters.assignee,
    t('calloutResponse.data.assignee')
  ),

  // Content Filters
  answers: withLabel(
    calloutResponseFilters.answers,
    t('calloutResponse.data.answers')
  ),
}));

/**
 * Callout Response Filters Hook
 * @description Provides filter configuration and form component management
 * @param callout - Reference to the current callout data
 * @param prefix - Optional prefix for filter keys
 * @returns Form components, filter groups, and items for the response view
 */
export function useCalloutResponseFilters(
  callout: Ref<GetCalloutDataWith<'form'> | undefined>,
  prefix: Ref<string> = ref('')
) {
  /**
   * Form Components Management
   * @description Extracts and manages form components from callout schema
   */
  const formComponents = computed(() =>
    callout.value
      ? getCalloutComponents(callout.value.formSchema).filter((c) => !!c.input)
      : []
  );

  /**
   * Answer Filter Configuration
   * @description Converts form components to filter items
   */
  const answerFilterItems = computed(() =>
    // TODO: Use @beabee/beabee-common method
    convertComponentsToFilters(formComponents.value, prefix.value + 'answers')
  );

  const answerItems = computed(() =>
    Object.entries(answerFilterItems.value).map(([id, item]) => ({
      id: id,
      label: item.label,
    }))
  );

  /**
   * Reviewer Management
   * @description Fetches and manages available callout reviewers
   */
  const reviewerItems = ref<SelectItem<string>[]>([]);
  watchEffect(async () => {
    const reviewers = callout.value
      ? await client.callout.reviewer.list(callout.value.slug)
      : [];
    reviewerItems.value = reviewers.map((reviewer) => ({
      id: reviewer.contact.id,
      label: reviewer.contact.displayName,
    }));
  });

  /**
   * Tag Management
   * @description Fetches and manages available callout tags
   */
  const tagItems = ref<SelectItem<string>[]>([]);
  watchEffect(async () => {
    const tags = callout.value
      ? await client.callout.tag.list(callout.value.slug)
      : [];
    tagItems.value = tags.map((tag) => ({ id: tag.id, label: tag.name }));
  });

  /**
   * Filter Groups Configuration
   * @description Organizes filters into logical groups
   */
  const filterGroups = computed<FilterGroups>(() => [
    {
      id: 'response',
      label: t('calloutResponse.dataGroup.response'),
      items: {
        [prefix.value + 'createdAt']: filterItems.value.createdAt,
        [prefix.value + 'assignee']: {
          ...filterItems.value.assignee,
          type: 'enum',
          options: reviewerItems.value,
        },
        [prefix.value + 'bucket']: {
          ...filterItems.value.bucket,
          type: 'enum',
          options: buckets.value,
          required: false,
        },
        [prefix.value + 'tags']: {
          ...filterItems.value.tags,
          options: tagItems.value,
        },
        [prefix.value + 'answers']: filterItems.value.answers,
      },
    },
    {
      id: 'answers',
      label: t('calloutResponse.dataGroup.answers'),
      items: answerFilterItems.value,
    },
  ]);

  return { formComponents, filterGroups, answerItems, reviewerItems, tagItems };
}
