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
 * A dropdown button component that displays a dropdown menu when clicked.
 * Used for actions that require selecting from a list of options.
 *
 * @component AppDropdownButton
 *
 * @example
 * <AppDropdownButton
 *   title="Options"
 *   variant="primaryOutlined"
 *   :icon="faEllipsisV"
 * >
 *   <div role="menuitem">Option 1</div>
 *   <div role="menuitem">Option 2</div>
 * </AppDropdownButton>
 */
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { onBeforeMount, onBeforeUnmount, ref, toRef, watch } from 'vue';
import { computed } from 'vue';

import AppButton from './AppButton.vue';

// Define the allowed variants for the dropdown button
export type DropdownButtonVariant =
  | 'primaryOutlined'
  | 'linkOutlined'
  | 'dangerOutlined'
  | 'greyOutlined';

// Define the component props interface
export interface AppDropdownButtonProps {
  /** Icon to display in the button */
  icon: IconDefinition;
  /** Button and dropdown title */
  title: string;
  /** Button style variant */
  variant: DropdownButtonVariant;
  /** Whether to show the title text */
  showTitle?: boolean;
  /** Whether the button is disabled */
  disabled?: boolean;
}

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
