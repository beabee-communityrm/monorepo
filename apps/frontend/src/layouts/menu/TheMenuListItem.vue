<template>
  <div
    ref="menuItemRef"
    class="group relative my-0.5 flex w-auto items-center justify-start rounded px-1 py-2 font-semibold text-body-80 md:justify-center lg:w-auto lg:justify-start"
    :class="isActive ? 'bg-primary-20' : 'hover:bg-primary-5'"
  >
    <font-awesome-icon class="fa-fw inline-block h-4" :icon="icon" size="lg" />

    <span class="ml-2 md:hidden lg:inline-block">{{ title }}</span>

    <Teleport to="body">
      <span
        v-if="showTooltip"
        class="fixed z-50 whitespace-nowrap rounded bg-black px-2 py-1 text-sm text-white"
        :style="tooltipStyle"
      >
        <span
          class="absolute right-full top-1/2 h-0 w-0 -translate-y-1/2 border-y-4 border-r-4 border-y-white/0 border-r-black"
        />
        {{ title }}
      </span>
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

defineProps<{
  title: string;
  icon: IconDefinition;
  isActive?: boolean;
}>();

const menuItemRef = ref<HTMLElement | null>(null);
const showTooltip = ref(false);
const tooltipPosition = ref({ top: 0, left: 0 });

const tooltipStyle = computed(() => ({
  top: `${tooltipPosition.value.top}px`,
  left: `${tooltipPosition.value.left}px`,
}));

onMounted(() => {
  const el = menuItemRef.value;
  if (!el) return;

  const handleMouseEnter = () => {
    if (window.innerWidth >= 768 && window.innerWidth < 1280) {
      // md:max-xl
      const rect = el.getBoundingClientRect();
      tooltipPosition.value = {
        top: rect.top + rect.height / 2 - 10, // Adjust as needed
        left: rect.right + 10, // Position to the right with a small gap
      };
      showTooltip.value = true;
    }
  };

  const handleMouseLeave = () => {
    showTooltip.value = false;
  };

  el.addEventListener('mouseenter', handleMouseEnter);
  el.addEventListener('mouseleave', handleMouseLeave);

  onBeforeUnmount(() => {
    el.removeEventListener('mouseenter', handleMouseEnter);
    el.removeEventListener('mouseleave', handleMouseLeave);
  });
});
</script>
