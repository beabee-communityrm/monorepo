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
 * A modal dialog component that displays content in an overlay with proper accessibility features.
 * Provides backdrop click prevention, scroll lock, and keyboard navigation support.
 *
 * @component AppModal
 *
 * @example
 * <AppModal
 *   :open="showModal"
 *   title="Confirm Action"
 *   close-button-text="Close dialog"
 *   @close="showModal = false"
 * >
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
  /** Whether the modal is open */
  open: boolean;
  /** Title displayed in the modal header */
  title?: string;
  /** Visual variant for styling */
  variant?: 'danger';
  /** Accessible text for the close button */
  closeButtonText?: string;
}

const props = withDefaults(defineProps<AppModalProps>(), {
  title: undefined,
  variant: undefined,
  closeButtonText: 'Close',
});

/**
 * Events emitted by the AppModal component
 */
const emit = defineEmits<{
  /** Emitted when the modal should be closed */
  (e: 'close'): void;
}>();

// Generate unique ID for ARIA relationships
const modalId = computed(
  () => `modal-${Math.random().toString(36).substring(2, 11)}`
);

const divRef = ref<HTMLElement>();

watch([toRef(props, 'open'), divRef], ([open]) => {
  if (divRef.value) {
    if (open) {
      disableBodyScroll(divRef.value);
    } else {
      enableBodyScroll(divRef.value);
    }
  }
});

onBeforeUnmount(() => {
  if (divRef.value && props.open) {
    enableBodyScroll(divRef.value);
  }
});
</script>
