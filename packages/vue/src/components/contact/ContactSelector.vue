<!--
  # ContactSelector
  Compact contact selector: prev/next buttons with fixed-width display of the current
  contact. Application-independent; all user-visible strings are passed as props.

  ## Props
  - modelValue: selected contact id ('' = first option, typically "self")
  - options: list of { id, firstname?, lastname?, email? }; first item often { id: '' } for "self"
  - label, selfOptionLabel, countTemplate, previousAriaLabel, nextAriaLabel

  ## Use in app
  Pass translated strings, e.g. :label="t('contacts.sendEmail.previewAsContact')"
  and :count-template="t('contactSelector.contactNOfTotal')" with %current%,%total% placeholders.
-->
<template>
  <div class="contact-selector">
    <AppLabel v-if="label" :label="label" class="mb-2 block" />
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
          class="contact-selector__name flex h-10 w-52 shrink-0 items-center border-0 bg-grey-lighter"
          :aria-label="label || undefined"
        >
          <AppInput
            :model-value="displayName"
            disabled
            hide-error-message
            class="contact-selector__name-input [&_input]:!bg-transparent h-full min-w-0 [&_input]:!truncate [&_input]:!border-0 [&_input]:!shadow-none [&_input]:!outline-none"
          />
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
  </div>
</template>

<script lang="ts" setup>
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { computed } from 'vue';

import { AppButton, AppButtonGroup } from '../button';
import { AppInput, AppLabel } from '../form';

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
    /** Label above the control (e.g. "Preview as contact" or "Select contact"). */
    label?: string;
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
    label: '',
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
}
</style>
