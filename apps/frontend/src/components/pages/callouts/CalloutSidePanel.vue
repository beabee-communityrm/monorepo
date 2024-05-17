<template>
  <transition name="side-panel">
    <aside
      v-if="show"
      class="fixed inset-y-0 left-0 z-20 w-full max-w-lg overflow-scroll bg-white p-8 shadow-lg"
    >
      <button
        class="absolute right-2 top-2 h-10 w-10 text-2xl hover:text-primary"
        type="button"
        @click="$emit('close')"
      >
        <font-awesome-icon :icon="faTimes" />
      </button>
      <slot />
    </aside>
  </transition>
</template>
<script lang="ts" setup>
import { faTimes } from '@fortawesome/free-solid-svg-icons';

defineEmits<{ (e: 'close'): void }>();
defineProps<{ show: boolean }>();
</script>

<style lang="postcss" scoped>
.side-panel-enter-active,
.side-panel-leave-active {
  @apply transition-transform;
}

.side-panel-enter-from,
.side-panel-leave-to {
  @apply -translate-x-full transform;
}

.side-panel-enter-to,
.side-panel-leave-from {
  @apply translate-x-0 transform;
}
</style>
