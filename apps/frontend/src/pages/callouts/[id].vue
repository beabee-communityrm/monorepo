<template>
  <router-view v-if="callout" :callout="callout" />
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { fetchCallout } from '@utils/api/callout';
import type { GetCalloutDataWith } from '@type';
import { watch } from 'vue';

const props = defineProps<{ id: string }>();
const callout =
  ref<GetCalloutDataWith<'form' | 'responseViewSchema' | 'variantNames'>>();

const route = useRoute();

watch(
  [() => props.id, () => route.query.lang],
  async () => {
    // callout.value = undefined;
    callout.value = await fetchCallout(
      props.id,
      ['form', 'responseViewSchema', 'variantNames'],
      route.query.lang ? route.query.lang.toString() : undefined
    );
  },
  { immediate: true }
);
</script>
