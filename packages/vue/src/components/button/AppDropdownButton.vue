<!--
  # AppDropdownButton
  A dropdown button component that shows a menu when clicked.
  Supports keyboard navigation and outside click detection for accessibility.
-->

<template>
  <AppButton
    ref="buttonRef"
    :variant="variant"
    :icon="icon"
    class="group"
    :class="open ? '!rounded-b-none !bg-white' : ''"
    :disabled="disabled"
    :title="title"
    :aria-label="title"
    :aria-expanded="open"
    :aria-haspopup="true"
    role="button"
    @click="handleClick"
  >
    <span v-if="showTitle">{{ title }}</span>

    <template #after>
      <div
        class="border text-left text-sm font-normal text-body-80 shadow-lg"
        :class="{ [sharedClasses]: true, hidden: !open }"
        role="menu"
        :aria-hidden="!open"
        @click.stop
      >
        <slot />
      </div>
      <div
        v-show="open"
        :class="sharedClasses"
        class="box-content w-full border-x pt-px"
        aria-hidden="true"
      />
    </template>
  </AppButton>
</template>

<script lang="ts" setup>
/**
 * Dropdown button component that displays a menu when clicked with keyboard navigation support.
 * Automatically closes on outside clicks and provides accessible menu interaction patterns.
 *
 * @component AppDropdownButton
 *
 * @example
 * <AppDropdownButton title="Actions" variant="primaryOutlined" :icon="faEllipsisV">
 *   <div role="menuitem" @click="editAction">Edit</div>
 *   <div role="menuitem" @click="deleteAction">Delete</div>
 * </AppDropdownButton>
 */
import { onBeforeMount, onBeforeUnmount, ref, toRef, watch } from 'vue';
import { computed } from 'vue';

import type { AppDropdownButtonProps } from '../../types/button';
import AppButton from './AppButton.vue';

// Variant type is now imported from types
export type { DropdownButtonVariant } from '../../types/button';

// Props interface is now imported from types
export type { AppDropdownButtonProps } from '../../types/button';

/**
 * Slots available in the AppDropdownButton component
 */
defineSlots<{
  /**
   * Default slot for dropdown menu content
   * @description Menu items with role="menuitem" for accessibility
   */
  default(): any;
}>();

const props = defineProps<AppDropdownButtonProps>();

const baseClasses = 'absolute top-full min-w-full -left-px z-20 bg-white';

// Border styles from AppButton
const variantClasses = {
  primaryOutlined: 'border-primary-40 group-hover:border-primary-70',
  linkOutlined: 'border-link',
  dangerOutlined: 'border-danger',
  greyOutlined: 'border-grey-light group-hover:border-grey',
} as const;

const sharedClasses = computed(
  () => `${baseClasses} ${variantClasses[props.variant]}`
);

const buttonRef = ref<InstanceType<typeof AppButton>>();
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
  if (!buttonRef.value?.$el.contains(evt.target as Node)) {
    open.value = false;
  }
}

// Keyboard navigation
function handleKeyDown(evt: KeyboardEvent) {
  if (open.value) {
    switch (evt.key) {
      case 'Escape':
        open.value = false;
        buttonRef.value?.$el.focus();
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
