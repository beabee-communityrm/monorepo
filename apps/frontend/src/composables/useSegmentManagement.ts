import type { GetSegmentDataWith } from '@beabee/beabee-common';

import { computed, onBeforeMount, ref } from 'vue';
import { useRoute } from 'vue-router';

import type { FilterGroups } from '#type/search';
import { defineParam, defineRulesParam } from '#utils/pagination';
import { isRuleGroupValidForFilterGroups } from '#utils/rules';

export function useSegmentManagement(
  basePath: string,
  totalSegmentsLabel: string,
  listSegments: () => Promise<GetSegmentDataWith<'itemCount'>[]>,
  listTotalSegmentItems: () => Promise<number>,
  filterGroups: FilterGroups
) {
  const route = useRoute();

  const currentSegmentId = defineParam('segment', (v) => v || '', 'replace');

  const segments = ref<GetSegmentDataWith<'itemCount'>[]>([]);

  const totalItems = ref<number | null>(null);

  function emptyTable() {
    return {
      items: [],
      total: 0,
      offset: 0,
      count: 0,
    };
  }

  const currentRules = defineRulesParam(
    computed(() => currentSegment.value?.ruleGroup)
  );

  const currentSegment = computed(() =>
    currentSegmentId.value
      ? segments.value.find((s) => s.id === currentSegmentId.value)
      : undefined
  );

  const hasUnsavedSegment = computed(
    () =>
      !!route.query.r &&
      !!currentRules.value &&
      currentRules.value.rules.length > 0
  );

  const hasInvalidRules = computed(
    () =>
      !!currentRules.value &&
      currentRules.value.rules.length > 0 &&
      !isRuleGroupValidForFilterGroups(currentRules.value, filterGroups)
  );

  const segmentItems = computed(() => [
    {
      id: '',
      label: totalSegmentsLabel,
      ...(totalItems.value !== null && { count: totalItems.value }),
      to: basePath,
    },
    ...segments.value.map((segment) => ({
      id: segment.id,
      label: segment.name,
      count: segment.itemCount ?? segment.itemCount,
      to: `${basePath}?segment=${segment.id}`,
    })),
  ]);

  function handleSavedSegment(segment: GetSegmentDataWith<'itemCount'>) {
    const segmentIndex = segments.value.findIndex((s) => s.id === segment.id);
    if (segmentIndex > -1) {
      segments.value[segmentIndex] = segment;
    } else {
      segments.value.push(segment);
    }
    currentSegmentId.value = segment.id;
  }

  async function handleListSegments() {
    segments.value = await listSegments();
    totalItems.value = await listTotalSegmentItems();
  }

  onBeforeMount(async () => {
    await handleListSegments();
  });

  return {
    currentSegmentId,
    currentSegment,
    totalItems,
    currentRules,
    hasUnsavedSegment,
    hasInvalidRules,
    emptyTable,
    segmentItems,
    handleSavedSegment,
  };
}
