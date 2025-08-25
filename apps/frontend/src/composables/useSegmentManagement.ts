import type { GetSegmentData, RuleGroup } from '@beabee/beabee-common';

import { client } from '@utils/api';
import { defineParam, defineRulesParam } from '@utils/pagination';
import { computed, onBeforeMount, ref } from 'vue';
import { useRoute } from 'vue-router';

export function useSegmentManagement(basePath: string, calloutSlug?: string) {
  const route = useRoute();

  const currentSegmentId = defineParam('segment', (v) => v || '', 'replace');
  const segments = ref<
    (GetSegmentData & {
      contactCount?: number;
      calloutResponseCount?: number;
    })[]
  >([]);
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
      label: calloutSlug ? 'All Responses' : 'All Contacts',
      ...(totalItems.value !== null && { count: totalItems.value }),
      to: basePath,
    },
    ...segments.value.map((segment) => ({
      id: segment.id,
      label: segment.name,
      count: segment.calloutResponseCount ?? segment.contactCount,
      to: `${basePath}?segment=${segment.id}`,
    })),
  ]);

  onBeforeMount(async () => {
    if (calloutSlug) {
      await handleListCalloutSegments(calloutSlug);
    } else {
      await handleListContactSegments();
    }
  });

  function handleSavedSegment(
    segment: GetSegmentData & {
      contactCount?: number;
      calloutResponseCount?: number;
    }
  ) {
    const segmentIndex = segments.value.findIndex((s) => s.id === segment.id);
    if (segmentIndex > -1) {
      segments.value[segmentIndex] = segment;
    } else {
      segments.value.push(segment);
    }
    currentSegmentId.value = segment.id;
  }

  async function handleListCalloutSegments(calloutSlug: string) {
    segments.value = await client.callout.segments.list(
      calloutSlug,
      { sort: 'order' },
      ['calloutResponseCount']
    );
    totalItems.value = (
      await client.callout.listResponses(calloutSlug, { limit: 1 })
    ).total;
  }

  async function handleListContactSegments() {
    segments.value = await client.segments.list({ sort: 'order' }, [
      'contactCount',
    ]);
    totalItems.value = (await client.contact.list({ limit: 1 })).total;
  }

  // Save a new segment (contacts or callouts)
  async function saveSegment(name: string, rules: RuleGroup) {
    let segment;
    if (calloutSlug) {
      segment = await client.callout.segments.create(calloutSlug, {
        calloutId: calloutSlug,
        name,
        ruleGroup: rules,
      });
    } else {
      segment = await client.segments.create({
        name,
        ruleGroup: rules,
      });
    }
    handleSavedSegment(segment);
    return segment;
  }

  // Update an existing segment (contacts or callouts)
  async function updateSegment(
    segmentId: string,
    name: string,
    rules: RuleGroup
  ) {
    let segment;
    if (calloutSlug) {
      segment = await client.callout.segments.update(calloutSlug, segmentId, {
        name,
        ruleGroup: rules,
      });
    } else {
      segment = await client.segments.update(segmentId, {
        name,
        ruleGroup: rules,
      });
    }
    handleSavedSegment(segment);
    return segment;
  }

  return {
    currentSegmentId,
    currentSegment,
    totalItems,
    currentRules,
    hasUnsavedSegment,
    segmentItems,
    handleSavedSegment,
    saveSegment,
    updateSegment,
  };
}
