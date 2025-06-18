<script setup lang="ts">
import { ref } from 'vue';

import type { AppStepperStep } from '../../types/stepper';
import AppStepper from './AppStepper.vue';

// Sample data for different scenarios
const basicSteps: AppStepperStep[] = [
  { name: 'Personal Info', validated: true, error: false },
  { name: 'Contact Details', validated: false, error: false },
  { name: 'Confirmation', validated: false, error: false },
];

const stepWithError: AppStepperStep[] = [
  { name: 'Step 1', validated: true, error: false },
  { name: 'Step 2', validated: false, error: true },
  { name: 'Step 3', validated: false, error: false },
  { name: 'Step 4', validated: false, error: false },
];

const longStepNames: AppStepperStep[] = [
  { name: 'Account Registration', validated: true, error: false },
  { name: 'Identity Verification', validated: true, error: false },
  { name: 'Payment Information', validated: false, error: false },
  { name: 'Terms and Conditions', validated: false, error: false },
  { name: 'Final Confirmation', validated: false, error: false },
];

// Reactive state for interactive examples
const currentStep = ref(1);
const interactiveSteps = ref([...basicSteps]);
const disabledStep = ref(0);
</script>

<template>
  <Story title="Navigation/AppStepper">
    <Variant title="Basic Usage" description="Default stepper with three steps">
      <AppStepper v-model="currentStep" :steps="basicSteps" />
      <div class="text-gray-600 mt-4 text-sm">
        Current step: {{ currentStep + 1 }} / {{ basicSteps.length }}
      </div>
    </Variant>

    <Variant
      title="With Error State"
      description="Stepper showing an error on the second step"
    >
      <AppStepper v-model="currentStep" :steps="stepWithError" />
    </Variant>

    <Variant
      title="Many Steps"
      description="Stepper with more steps and longer names"
    >
      <AppStepper v-model="currentStep" :steps="longStepNames" />
    </Variant>

    <Variant title="Disabled State" description="Stepper in disabled state">
      <AppStepper v-model="disabledStep" :steps="basicSteps" :disabled="true" />
      <div class="text-gray-600 mt-4 text-sm">
        This stepper is disabled and cannot be interacted with.
      </div>
    </Variant>

    <Variant
      title="Interactive Example"
      description="Full example with step controls"
    >
      <AppStepper v-model="currentStep" :steps="interactiveSteps" />

      <div class="mt-6 space-y-4">
        <div class="flex gap-2">
          <button
            @click="currentStep = Math.max(0, currentStep - 1)"
            :disabled="currentStep === 0"
            class="bg-blue-500 rounded px-4 py-2 text-white disabled:opacity-50"
          >
            Previous
          </button>
          <button
            @click="
              currentStep = Math.min(
                interactiveSteps.length - 1,
                currentStep + 1
              )
            "
            :disabled="currentStep === interactiveSteps.length - 1"
            class="bg-blue-500 rounded px-4 py-2 text-white disabled:opacity-50"
          >
            Next
          </button>
        </div>

        <div class="space-y-2">
          <div>
            <label>
              <input
                v-model="interactiveSteps[currentStep].validated"
                type="checkbox"
                class="mr-2"
              />
              Mark current step as validated
            </label>
          </div>
          <div>
            <label>
              <input
                v-model="interactiveSteps[currentStep].error"
                type="checkbox"
                class="mr-2"
              />
              Mark current step as error
            </label>
          </div>
        </div>

        <div class="text-gray-600 text-sm">
          <strong>Current Step:</strong> {{ interactiveSteps[currentStep].name
          }}<br />
          <strong>Status:</strong>
          <span v-if="interactiveSteps[currentStep].error" class="text-red-600"
            >Error</span
          >
          <span
            v-else-if="interactiveSteps[currentStep].validated"
            class="text-green-600"
            >Validated</span
          >
          <span v-else class="text-gray-500">In Progress</span>
        </div>
      </div>
    </Variant>

    <Variant
      title="Custom Aria Label"
      description="Stepper with custom accessibility label"
    >
      <AppStepper
        v-model="currentStep"
        :steps="basicSteps"
        aria-label="Registration process steps"
      />
    </Variant>
  </Story>
</template>
