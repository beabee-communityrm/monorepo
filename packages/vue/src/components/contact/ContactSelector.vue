<template>
  <div class="flex flex-wrap items-center gap-2">
    <AppInput
      :model-value="displayName"
      disabled
      hide-error-message
      class="w-52 shrink-0"
      :aria-label="nameAriaLabel"
    >
      <template #prefixAction>
        <button
          type="button"
          :class="actionButtonClass"
          :disabled="currentIndex <= 0"
          :aria-label="t('actions.previous')"
          @click="goToIndex(currentIndex - 1)"
        >
          <font-awesome-icon :icon="faCaretLeft" aria-hidden="true" />
        </button>
      </template>
      <template #suffixAction>
        <button
          type="button"
          :class="actionButtonClass"
          :disabled="currentIndex >= options.length - 1"
          :aria-label="t('actions.next')"
          @click="goToIndex(currentIndex + 1)"
        >
          <font-awesome-icon :icon="faCaretRight" aria-hidden="true" />
        </button>
      </template>
    </AppInput>
    <span v-if="options.length > 1" class="text-body-80">
      {{ countText }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { AppInput } from '../form';

const actionButtonClass =
  'flex h-10 w-10 shrink-0 items-center justify-center text-primary-80 hover:bg-primary-10 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50';

/**
 * Option for the selector. First item is often { id: '' } for "self" / current user.
 */
export interface ContactSelectorOption {
  id: string;
  firstname?: string;
  lastname?: string;
  email?: string;
}

const model = defineModel<string>({ default: '' });

const props = defineProps<{
  /** Options: first is often { id: '' } for self, then additional contacts. */
  options: ContactSelectorOption[];
}>();

const { t } = useI18n();

const currentIndex = computed(() => {
  const idx = props.options.findIndex((o) => o.id === model.value);
  return idx >= 0 ? idx : 0;
});

const displayName = computed(() => {
  const opt = props.options[currentIndex.value];
  if (!opt) return '';
  if (opt.id === '') return t('contactSelector.selfOption');
  const full = `${opt.firstname ?? ''} ${opt.lastname ?? ''}`.trim();
  return full || opt.email || `Contact ${currentIndex.value + 1}`;
});

const countText = computed(() =>
  t('contactSelector.contactNOfTotal', {
    current: currentIndex.value + 1,
    total: props.options.length,
  })
);

const nameAriaLabel = computed(() =>
  props.options.length > 1 ? countText.value : undefined
);

function goToIndex(index: number) {
  if (index < 0 || index >= props.options.length) return;
  model.value = props.options[index].id;
}
</script>

<style scoped>
/* Constrain disabled input text so it doesn't overflow the fixed-width container */
:deep(input) {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
