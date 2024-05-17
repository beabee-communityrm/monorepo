<template>
  <div class="flex items-center gap-4 rounded bg-white p-6">
    <div class="flex-0 self-start text-2xl" :class="textColor">
      <font-awesome-icon :icon="icon" />
    </div>
    <div class="flex-1">
      <AppSubHeading :class="textColor">
        {{ title }}
      </AppSubHeading>
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { computed } from 'vue';
import AppSubHeading from './AppSubHeading.vue';

const props = defineProps<{
  title: string;
  icon: IconDefinition;
  variant: 'success' | 'info';
}>();

const textColor = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'text-success';
    case 'info':
      return 'text-body-80';
    default:
      return '';
  }
});
</script>
