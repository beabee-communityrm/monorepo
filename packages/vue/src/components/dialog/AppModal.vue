<!--
  # AppModal
  A modal dialog component with proper accessibility features and body scroll lock.
  Displays content in an overlay with backdrop click prevention and keyboard navigation.
-->
<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-40 flex h-full items-center justify-center bg-black bg-opacity-50 p-4"
      :class="{ hidden: !open }"
      role="dialog"
      :aria-labelledby="title ? modalId + '-title' : undefined"
      :aria-modal="true"
      :aria-hidden="!open"
    >
      <div
        ref="divRef"
        class="relative flex max-h-full flex-col rounded bg-white p-6 shadow-lg md:max-w-[28rem] md:p-8 lg:w-[28rem]"
        v-bind="$attrs"
        @click.stop
      >
        <button
          class="absolute right-0 top-0 h-8 w-8 hover:text-primary"
          type="button"
          :aria-label="closeButtonText"
          @click="$emit('close')"
        >
          <font-awesome-icon :icon="faTimes" />
        </button>
        <h2
          v-if="title"
          :id="modalId + '-title'"
          class="mb-4 text-lg font-semibold"
        >
          <span :class="{ 'text-danger': variant === 'danger' }">
            {{ title }}
          </span>
        </h2>
        <div class="overflow-auto">
          <slot></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
/**
 * Modal dialog component that displays content in an overlay with proper accessibility.
 * Provides backdrop click prevention, body scroll lock, and keyboard navigation support.
 *
 * @component AppModal
 *
 * @example
 * <AppModal :open="showModal" title="Confirm Action" @close="showModal = false">
 *   <p>Are you sure you want to proceed?</p>
 * </AppModal>
 */
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import { computed, onBeforeUnmount, ref, toRef, watch } from 'vue';

/**
 * Props for the AppModal component
 */
export interface AppModalProps {
  /** Whether the modal is currently open and visible */
  open: boolean;
  /** Title displayed in the modal header */
  title?: string;
  /** Visual variant affecting title styling */
  variant?: 'danger';
  /** Accessible text for the close button */
  closeButtonText?: string;
}

/**
 * Events emitted by the AppModal component
 */
const emit = defineEmits<{
  /**
   * Emitted when the modal should be closed
   */
  close: [];
}>();

/**
 * Slots available in the AppModal component
 */
defineSlots<{
  /**
   * Default slot for modal content
   * @description The main content area of the modal
   */
  default(): any;
}>();

const props = withDefaults(defineProps<AppModalProps>(), {
  title: undefined,
  variant: undefined,
  closeButtonText: 'Close',
});

// Generate unique ID for ARIA relationships
const modalId = computed(
  () => `modal-${Math.random().toString(36).substring(2, 11)}`
);

const divRef = ref<HTMLElement>();

/**
 * Manages body scroll lock when modal opens/closes
 */
watch([toRef(props, 'open'), divRef], ([open]) => {
  if (divRef.value) {
    if (open) {
      disableBodyScroll(divRef.value);
    } else {
      enableBodyScroll(divRef.value);
    }
  }
});

/**
 * Cleanup scroll lock on component unmount
 */
onBeforeUnmount(() => {
  if (divRef.value && props.open) {
    enableBodyScroll(divRef.value);
  }
});
</script>
