import {
  type CalloutResponseFilterName,
  calloutResponseFilters,
  getCalloutComponents,
} from '@beabee/beabee-common';
import { computed, ref, watchEffect, type Ref } from 'vue';
import i18n from '../../../lib/i18n';
import { type Header } from '../../table/table.interface';

import type { FilterItems, GetCalloutDataWith } from '@type';
import { withLabel } from '@utils/rules';
import { fetchTags } from '@utils/api/callout';
import type { SelectItem } from '@components/forms/form.interface';
import { convertComponentsToFilters } from '@utils/callouts';

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

const filterItems = computed<FilterItems<CalloutResponseFilterName>>(() => ({
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
  tags: withLabel(calloutResponseFilters.tags, t('calloutResponse.data.tags')),
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
}));

export function useCalloutResponseFilters(
  callout: Ref<GetCalloutDataWith<'form'> | undefined>,
  prefix: Ref<string> = ref('')
) {
  const formComponents = computed(() =>
    callout.value
      ? getCalloutComponents(callout.value.formSchema).filter((c) => !!c.input)
      : []
  );

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

  const tagItems = ref<SelectItem<string>[]>([]);
  watchEffect(async () => {
    const tags = callout.value ? await fetchTags(callout.value.slug) : [];
    tagItems.value = tags.map((tag) => ({ id: tag.id, label: tag.name }));
  });

  const filterGroups = computed(() => [
    {
      id: 'response',
      label: t('calloutResponse.dataGroup.response'),
      items: {
        [prefix.value + 'createdAt']: filterItems.value.createdAt,
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

  return { formComponents, filterGroups, answerItems, tagItems };
}
