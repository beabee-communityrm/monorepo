<template>
  <div class="flex flex-wrap items-center gap-2">
    <AppButtonGroup>
      <AppButton
        type="button"
        variant="primaryOutlined"
        :icon="faCaretLeft"
        :aria-label="previousAriaLabel"
        :disabled="currentIndex <= 0"
        @click="goToIndex(currentIndex - 1)"
      />
      <div
        class="h-10 w-52 shrink-0 items-center border-0 bg-grey-lighter"
        :aria-label="nameAriaLabel || undefined"
      >
        <AppInput :model-value="displayName" disabled hide-error-message />
      </div>
      <AppButton
        type="button"
        variant="primaryOutlined"
        :icon="faCaretRight"
        :aria-label="nextAriaLabel"
        :disabled="currentIndex >= options.length - 1"
        @click="goToIndex(currentIndex + 1)"
      />
    </AppButtonGroup>
    <span v-if="countTemplate" class="text-body-80">
      {{ countText }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { computed } from 'vue';

import { AppButton, AppButtonGroup } from '../button';
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
.contact-selector__name,
.contact-selector__name-input :deep(> div:first-child),
.contact-selector__name-input :deep(input) {
  border: none !important;
  border-radius: 0;
  box-shadow: none !important;
  outline: none !important;
  background: transparent;
}
.contact-selector__name-input :deep(> div:first-child),
.contact-selector__name-input :deep(input) {
  height: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
