<template>
  <ul class="mb-8 flex gap-4">
    <li
      v-for="(step, stepIndex) in steps"
      :key="stepIndex"
      class="group relative my-1 max-w-[200px] flex-1 rounded p-4 text-center"
      :class="[
        stepIndex === modelValue
          ? 'bg-white text-link'
          : 'text-primary-60 cursor-pointer bg-primary-5',
        step.error ? '!text-danger' : '',
      ]"
      @click="emit('update:modelValue', stepIndex)"
    >
      <span
        class="absolute -inset-x-2 mt-2 border-t-2 border-grey group-first:left-1/2 group-last:right-1/2"
      />
      <span
        class="relative mr-2 mt-px inline-block h-4 w-4 rounded-full border-2"
        :class="
          step.validated
            ? 'border-link bg-link'
            : stepIndex === modelValue
              ? 'border-link bg-white'
              : 'border-grey bg-primary-5'
        "
      />
      <h4 class="font-semibold">{{ step.name }}</h4>
    </li>
  </ul>
</template>

<script lang="ts" setup>
import type { AppStepperStep } from '@type/app-stepper-step';
defineProps<{ steps: AppStepperStep[]; modelValue: number }>();
const emit = defineEmits(['update:modelValue']);
</script>
