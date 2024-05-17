<template>
  <aside
    class="rounded border border-t-8 bg-white p-4 text-sm text-body-80"
    :class="colorClass[0]"
  >
    <header
      class="flex items-start gap-4"
      :class="$slots.default ? 'mb-2' : ''"
    >
      <span
        class="flex flex-1 items-baseline gap-2 font-bold"
        :class="colorClass[1]"
      >
        <span><font-awesome-icon v-if="icon" :icon="icon" /></span>
        <span>{{ title }}</span>
      </span>
      <template v-if="removeable !== false">
        <svg
          class="h-5 w-5 -rotate-90"
          :class="colorClass[2]"
          viewBox="0 0 24 24"
        >
          <circle
            class="fill-none stroke-[4] transition-[stroke-dasharray]"
            :r="circleRadius"
            cx="12"
            cy="12"
            :style="circleStyle"
          />
        </svg>
        <a
          class="inline-block w-5 cursor-pointer text-center leading-5 hover:bg-grey-lighter hover:text-body"
          @click="emit('remove')"
        >
          <font-awesome-icon :icon="faTimes" />
        </a>
      </template>
    </header>

    <slot></slot>
  </aside>
</template>

<script lang="ts" setup>
import {
  type IconDefinition,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { computed, ref } from 'vue';

const emit = defineEmits(['remove']);
const props = defineProps<{
  variant: 'success' | 'warning' | 'error' | 'info';
  title: string;
  icon?: IconDefinition;
  removeable?: 'auto' | boolean;
}>();

const circleRadius = 10;
const circleSize = Math.PI * circleRadius * 2;
const circleProgress = ref<number>(0);
const circleStep = 1 / 8;

if (props.removeable === 'auto') {
  circleProgress.value = circleStep;
  const interval = window.setInterval(() => {
    circleProgress.value = circleProgress.value + circleStep;
    if (circleProgress.value > 1) {
      window.clearInterval(interval);
      emit('remove');
    }
  }, 1000);
}

const circleStyle = computed(() => ({
  'stroke-dasharray': `${circleSize * circleProgress.value} ${circleSize}`,
}));

const colorClass = computed(() => {
  switch (props.variant) {
    case 'success':
      return ['border-success', 'text-success', 'stroke-success'];
    case 'warning':
      return ['border-warning', '', 'stroke-warning'];
    case 'error':
      return ['border-danger', 'text-danger', 'stroke-danger'];
    default:
      return ['border-primary', 'text-primary', 'stroke-primary'];
  }
});
</script>
<style scoped></style>
