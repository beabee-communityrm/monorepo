<template>
  <section class="mb-4">
    <h3 class="mb-2 font-title text-xl font-semibold">
      {{ content.mailTitle }}
    </h3>
    <div class="content-message mb-4 text-sm" v-html="content.mailText" />
    <AppCheckbox v-model="optIn" :label="content.mailOptIn" class="font-bold" />
  </section>
</template>
<script lang="ts" setup>
import { AppCheckbox } from '@beabee/vue/components';

import { computed } from 'vue';

const emit = defineEmits(['update:modelValue']);
const props = defineProps<{
  modelValue: boolean;
  content: {
    mailTitle: string;
    mailText: string;
    mailOptIn: string;
  };
}>();

const optIn = computed({
  get: () => props.modelValue,
  set: (newOptIn) => emit('update:modelValue', newOptIn),
});
</script>
