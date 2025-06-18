<!--
  # AppStepper
  A step-by-step progress indicator component that displays a series of steps with their completion status.

  ## Features
  - Visual progress indicator with step names
  - Click navigation between steps
  - Visual states for validated, error, and current steps
  - Responsive design with proper spacing
  - Accessibility support with semantic HTML and ARIA attributes

  ## Usage
  Used for multi-step processes like forms, wizards, or guided workflows where users need to see their current position and overall progress.
-->
<template>
  <nav role="navigation" :aria-label="ariaLabel">
    <ol class="mb-8 flex gap-4" role="list">
      <li
        v-for="(step, stepIndex) in steps"
        :key="`step-${stepIndex}`"
        class="group relative my-1 max-w-[200px] flex-1 rounded p-4 text-center transition-colors"
        :class="[
          stepIndex === modelValue
            ? 'bg-white text-link'
            : 'text-primary-60 cursor-pointer bg-primary-5 hover:bg-primary-10',
          step.error ? '!text-danger' : '',
          disabled ? 'cursor-not-allowed opacity-60' : '',
        ]"
        role="listitem"
        @click="handleStepClick(stepIndex)"
        @keydown="handleStepKeydown($event, stepIndex)"
        :tabindex="disabled ? -1 : 0"
        :aria-current="stepIndex === modelValue ? 'step' : undefined"
        :aria-disabled="disabled"
      >
        <!-- Progress line connector -->
        <span
          class="absolute -inset-x-2 mt-2 border-t-2 border-grey group-first:left-1/2 group-last:right-1/2"
          aria-hidden="true"
        />

        <!-- Step indicator circle -->
        <span
          class="relative mr-2 mt-px inline-block h-4 w-4 rounded-full border-2 transition-colors"
          :class="
            step.validated
              ? 'border-link bg-link'
              : stepIndex === modelValue
                ? 'border-link bg-white'
                : 'border-grey bg-primary-5'
          "
          :aria-hidden="true"
        />

        <!-- Step name -->
        <h4 class="font-semibold" :id="`step-${stepIndex}-label`">
          {{ step.name }}
        </h4>

        <!-- Screen reader only status information -->
        <span class="sr-only">
          <template v-if="step.error"> , has error </template>
          <template v-else-if="step.validated"> , completed </template>
          <template v-else-if="stepIndex === modelValue">
            , current step
          </template>
        </span>
      </li>
    </ol>
  </nav>
</template>

<script lang="ts" setup>
/**
 * Step-by-step progress indicator component for multi-step processes.
 * Displays a horizontal list of steps with visual indicators for completion status.
 *
 * @component AppStepper
 */
import type { AppStepperStep } from '../../types/stepper';

/**
 * Props for the AppStepper component
 */
export interface AppStepperProps {
  /** Array of steps to display in the stepper */
  steps: AppStepperStep[];
  /** The index of the currently active step (0-based) */
  modelValue: number;
  /** Whether the stepper is disabled (prevents navigation) */
  disabled?: boolean;
  /** Accessible label for the stepper navigation */
  ariaLabel?: string;
}

const props = withDefaults(defineProps<AppStepperProps>(), {
  disabled: false,
  ariaLabel: 'Step progress',
});

/**
 * Events emitted by the AppStepper component
 */
const emit = defineEmits<{
  /**
   * Emitted when a step is clicked or activated
   * @param stepIndex - The index of the selected step
   */
  'update:modelValue': [stepIndex: number];
}>();

/**
 * Handles step click events
 */
function handleStepClick(stepIndex: number): void {
  if (!props.disabled && stepIndex !== props.modelValue) {
    emit('update:modelValue', stepIndex);
  }
}

/**
 * Handles keyboard navigation for steps
 */
function handleStepKeydown(event: KeyboardEvent, stepIndex: number): void {
  if (props.disabled) return;

  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      if (stepIndex !== props.modelValue) {
        emit('update:modelValue', stepIndex);
      }
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      event.preventDefault();
      if (stepIndex > 0) {
        emit('update:modelValue', stepIndex - 1);
      }
      break;
    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault();
      if (stepIndex < props.steps.length - 1) {
        emit('update:modelValue', stepIndex + 1);
      }
      break;
    case 'Home':
      event.preventDefault();
      emit('update:modelValue', 0);
      break;
    case 'End':
      event.preventDefault();
      emit('update:modelValue', props.steps.length - 1);
      break;
  }
}
</script>
