<!--
  # AppDropdownButton
  A dropdown button component that shows a menu when clicked.
  Supports keyboard navigation and outside click detection for accessibility.
-->

<template>
  <div ref="containerRef" class="relative inline-block">
    <AppButton
      :color="color"
      :variant="variant"
      :icon="icon"
      class="group"
      :disabled="disabled"
      :title="title"
      :aria-label="title"
      :aria-expanded="open"
      :aria-haspopup="true"
      role="button"
      @click="handleClick"
    >
      <span v-if="showTitle">{{ title }}</span>
    </AppButton>

    <div
      v-show="open"
      class="border text-left text-sm font-normal text-body-80 shadow-lg"
      :class="[sharedClasses]"
      role="menu"
      :aria-hidden="!open"
      @click.stop
    >
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
/**
 * Dropdown button component that displays a menu when clicked with keyboard navigation support.
 * Automatically closes on outside clicks and provides accessible menu interaction patterns.
 *
 * @component AppDropdownButton
 *
 * @example
 * <AppDropdownButton title="Actions" color="primary" variant="outline" icon="fa6-solid:ellipsis-vertical">
 *   <div role="menuitem" @click="editAction">Edit</div>
 *   <div role="menuitem" @click="deleteAction">Delete</div>
 * </AppDropdownButton>
 */
import {
  onBeforeMount,
  onBeforeUnmount,
  ref,
  toRef,
  watch,
  computed,
} from 'vue';

import AppButton, {
  type ButtonColor,
  type ButtonVariant,
} from './AppButton.vue';

export interface AppDropdownButtonProps {
  /** Iconify icon string for the button trigger, e.g. "fa6-solid:folder" */
  icon: string;
  /** Button title and accessible label text */
  title: string;
  /** Button color */
  color: ButtonColor;
  /** Button variant */
  variant: ButtonVariant;
  /** Whether to display the title text alongside the icon */
  showTitle?: boolean;
  /** Whether the dropdown button is disabled */
  disabled?: boolean;
}

defineSlots<{
  default(): any;
}>();

const props = defineProps<AppDropdownButtonProps>();

const variantBorderClasses: Record<string, string> = {
  'primary-outline': 'border-primary-40 hover:border-primary-70',
  'link-outline': 'border-link',
  'danger-outline': 'border-danger',
  'neutral-outline': 'border-grey-light hover:border-grey',
};

const sharedClasses = computed(() => {
  const key = `${props.color}-${props.variant}`;
  const borderClass = variantBorderClasses[key] ?? 'border-grey-light';
  return `absolute top-full min-w-full -left-px z-20 bg-white ${borderClass}`;
});

const containerRef = ref<HTMLElement | null>(null);
const open = ref(false);

watch(toRef(props, 'disabled'), (disabled) => {
  if (disabled) open.value = false;
});

function handleClick() {
  if (!props.disabled) {
    open.value = !open.value;
  }
}

function handleOutsideClick(evt: Event) {
  if (!containerRef.value?.contains(evt.target as Node)) {
    open.value = false;
  }
}

function handleKeyDown(evt: KeyboardEvent) {
  if (open.value) {
    switch (evt.key) {
      case 'Escape':
        open.value = false;
        containerRef.value?.querySelector('button')?.focus();
        break;
      case 'Tab':
        open.value = false;
        break;
    }
  }
}

onBeforeMount(() => {
  document.addEventListener('click', handleOutsideClick);
  document.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick);
  document.removeEventListener('keydown', handleKeyDown);
});
</script>
