<template>
  <div>
    <h4 class="mb-1 text-lg">{{ title }}</h4>
    <div class="content-message mb-4 text-sm" v-html="text" />
    <AppCheckbox v-model="value" :label="label" class="font-bold" />
  </div>
</template>
<script lang="ts" setup>
import { computed } from 'vue';
import AppCheckbox from './forms/AppCheckbox.vue';

const emit = defineEmits(['update:modelValue']);
const props = defineProps<{
  modelValue: boolean;
  title: string;
  text: string;
  label: string;
}>();

const value = computed({
  get: () => props.modelValue,
  set: (newOptIn) => emit('update:modelValue', newOptIn),
});
</script>
