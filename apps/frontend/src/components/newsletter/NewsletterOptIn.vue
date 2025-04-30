<template>
  <section>
    <h3 class="mb-2 font-title text-xl font-semibold">{{ title }}</h3>
    <div class="content-message mb-4 text-sm" v-html="text" />
    <AppCheckboxGroup
      v-if="groups.length > 0"
      v-model="optInGroups"
      :options="groups"
    />
    <AppCheckbox
      v-else
      v-model="optInStatus"
      :label="optIn"
      class="font-bold"
    />
  </section>
</template>

<script lang="ts" setup>
import type { NewsletterGroupData } from '@beabee/beabee-common';
import { AppCheckbox, AppCheckboxGroup } from '@beabee/vue/components';
import { watch } from 'vue';

defineProps<{
  title: string;
  text: string;
  optIn: string;
  groups: NewsletterGroupData[];
}>();

const optInStatus = defineModel<boolean>({ default: false });
const optInGroups = defineModel<string[]>('optInGroups', {
  default: [],
});

watch(optInGroups, (newGroups) => {
  optInStatus.value = newGroups.length > 0;
});
</script>
