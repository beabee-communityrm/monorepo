<template>
  <div class="flex flex-wrap items-center gap-2">
    <AppInput
      :model-value="displayName"
      disabled
      hide-error-message
      class="w-52 shrink-0"
      :aria-label="nameAriaLabel || undefined"
    >
      <template #prefixAction>
        <button
          type="button"
          class="flex h-10 w-10 shrink-0 items-center justify-center text-primary-80 hover:bg-primary-10 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="currentIndex <= 0"
          :aria-label="previousAriaLabel"
          @click="goToIndex(currentIndex - 1)"
        >
          <font-awesome-icon :icon="faCaretLeft" aria-hidden="true" />
        </button>
      </template>
      <template #suffixAction>
        <button
          type="button"
          class="flex h-10 w-10 shrink-0 items-center justify-center text-primary-80 hover:bg-primary-10 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="currentIndex >= options.length - 1"
          :aria-label="nextAriaLabel"
          @click="goToIndex(currentIndex + 1)"
        >
          <font-awesome-icon :icon="faCaretRight" aria-hidden="true" />
        </button>
      </template>
    </AppInput>
    <span v-if="countTemplate" class="text-body-80">
      {{ countText }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { computed } from 'vue';

import { AppInput } from '../form';

/**
 * Option for the selector. First item is often { id: '' } for "self" / current user.
 */
export interface ContactSelectorOption {
  id: string;
  firstname?: string;
  lastname?: string;
  email?: string;
}

const props = withDefaults(
  defineProps<{
    /** Selected contact id; empty string = first option (e.g. "self"). */
    modelValue: string;
    /** Options: first is often { id: '' } for self, then additional contacts. */
    options: ContactSelectorOption[];
    /** Optional aria-label for the name display (e.g. same as parent's visible label). */
    nameAriaLabel?: string;
    /** Text shown when the selected option has id ''. */
    selfOptionLabel?: string;
    /** Template for count, e.g. "Contact %current% of %total%". Use %current% and %total% (or {current}/{total}) so i18n does not interpolate. */
    countTemplate?: string;
    /** Aria-label for the previous button. */
    previousAriaLabel?: string;
    /** Aria-label for the next button. */
    nextAriaLabel?: string;
  }>(),
  {
    nameAriaLabel: '',
    selfOptionLabel: 'Myself',
    countTemplate: '',
    previousAriaLabel: 'Previous',
    nextAriaLabel: 'Next',
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const currentIndex = computed(() => {
  const idx = props.options.findIndex((o) => o.id === props.modelValue);
  return idx >= 0 ? idx : 0;
});

const displayName = computed(() => {
  const opt = props.options[currentIndex.value];
  if (!opt) return '';
  if (opt.id === '') return props.selfOptionLabel;
  const full = `${opt.firstname ?? ''} ${opt.lastname ?? ''}`.trim();
  return full || opt.email || `Contact ${currentIndex.value + 1}`;
});

const countText = computed(() => {
  if (!props.countTemplate) return '';
  return props.countTemplate
    .replace(/%current%/g, String(currentIndex.value + 1))
    .replace(/%total%/g, String(props.options.length))
    .replace(/\{current\}/g, String(currentIndex.value + 1))
    .replace(/\{total\}/g, String(props.options.length));
});

function goToIndex(index: number) {
  if (index < 0 || index >= props.options.length) return;
  emit('update:modelValue', props.options[index].id);
}
</script>

<style scoped>
:deep(input) {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
