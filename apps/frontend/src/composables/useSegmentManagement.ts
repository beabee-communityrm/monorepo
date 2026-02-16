import type { GetSegmentDataWith } from '@beabee/beabee-common';

import { computed, onBeforeMount, ref } from 'vue';
import { useRoute } from 'vue-router';

import { defineParam, defineRulesParam } from '#utils/pagination';

export function useSegmentManagement(
  basePath: string,
  totalSegmentsLabel: string,
  listSegments: () => Promise<GetSegmentDataWith<'itemCount'>[]>,
  listTotalSegmentItems: () => Promise<number>
) {
  const route = useRoute();

  const currentSegmentId = defineParam('segment', (v) => v || '', 'replace');

  const segments = ref<GetSegmentDataWith<'itemCount'>[]>([]);

  const totalItems = ref<number | null>(null);

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
    segmentItems,
    handleSavedSegment,
  };
}
