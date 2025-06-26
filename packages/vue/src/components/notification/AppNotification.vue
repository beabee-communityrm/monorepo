<template>
  <aside
    v-if="isVisible"
    class="rounded border border-t-8 bg-white text-sm text-body-80"
    :class="[
      colorClass[0],
      mode === 'inline' ? 'px-4 py-1.5' : 'p-4',
      mode === 'inline' ? 'border-t-2' : 'border-t-8',
    ]"
    role="alert"
    :aria-live="variant === 'error' ? 'assertive' : 'polite'"
    :aria-atomic="true"
  >
    <header
      class="flex items-start gap-4"
      :class="[
        $slots.default ? 'mb-2' : '',
        mode === 'inline' && 'items-center',
      ]"
    >
      <span
        class="flex flex-1 items-baseline gap-2"
        :class="[
          colorClass[1],
          mode === 'inline' ? 'font-normal' : 'font-bold',
        ]"
      >
        <span v-if="icon" class="notification-icon" aria-hidden="true">
          <font-awesome-icon :icon="icon" />
        </span>
        <span>{{ title }}</span>
      </span>
      <template v-if="removeable !== false">
        <svg
          class="h-5 w-5 -rotate-90"
          :class="colorClass[2]"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            class="fill-none stroke-[4] transition-[stroke-dasharray]"
            :r="circleRadius"
            cx="12"
            cy="12"
            :style="circleStyle"
          />
        </svg>
        <button
          class="inline-block w-5 cursor-pointer text-center leading-5 hover:bg-grey-lighter hover:text-body"
          :aria-label="t('notifications.remove')"
          @click="handleRemove"
        >
          <font-awesome-icon :icon="faTimes" aria-hidden="true" />
        </button>
      </template>
    </header>

    <div v-if="description" class="sr-only">{{ description }}</div>
    <div
      v-if="$slots.default"
      :id="`notification-${id}-content`"
      class="notification-content"
    >
      <slot></slot>
    </div>
  </aside>
</template>

<script lang="ts" setup>
/**
 * A notification component that displays messages with different variants
 * and optional auto-removal functionality.
 *
 * @component AppNotification
 */
import {
  type IconDefinition,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

export interface AppNotificationProps {
  /** Unique identifier for the notification */
  id?: number;
  /** The type of notification */
  variant: 'success' | 'warning' | 'error' | 'info';
  /** The main notification message */
  title: string;
  /** Additional description for screen readers */
  description?: string;
  /** Optional icon to display */
  icon?: IconDefinition;
  /** Whether and how the notification can be removed */
  removeable?: 'auto' | boolean;
  /** Display mode of the notification */
  mode?: 'normal' | 'inline';
}

const emit = defineEmits(['remove']);
const props = withDefaults(defineProps<AppNotificationProps>(), {
  id: () => Math.floor(Math.random() * 1000000),
  removeable: false,
  description: undefined,
  icon: undefined,
  mode: 'normal',
});

const isVisible = ref(true);

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

const handleRemove = () => {
  emit('remove');
  setTimeout(() => {
    isVisible.value = false;
  }, 0);
};
</script>
<style scoped></style>
