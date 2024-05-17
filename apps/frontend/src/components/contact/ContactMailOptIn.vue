<template>
  <AppOptIn
    v-model="optIn"
    :title="content.mailTitle"
    :text="content.mailText"
    :label="content.mailOptIn"
    class="mb-4"
  />
</template>
<script lang="ts" setup>
import { computed } from 'vue';
import AppOptIn from '../AppOptIn.vue';

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
