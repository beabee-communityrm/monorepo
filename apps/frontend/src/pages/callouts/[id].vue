<template>
  <router-view v-if="callout" :callout="callout" />
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { client } from '@utils/api';
import { watch } from 'vue';
import type { GetCalloutDataWith } from '@beabee/beabee-common';

const props = defineProps<{ id: string }>();
const callout =
  ref<GetCalloutDataWith<'form' | 'responseViewSchema' | 'variantNames'>>();

const route = useRoute();

watch(
  [() => props.id, () => route.query.lang],
  async () => {
    // callout.value = undefined;
    callout.value = await client.callout.get(
      props.id,
      ['form', 'responseViewSchema', 'variantNames'],
      route.query.lang ? route.query.lang.toString() : undefined
    );
  },
  { immediate: true }
);
</script>
