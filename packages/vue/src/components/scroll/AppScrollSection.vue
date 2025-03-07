<template>
  <section ref="sectionRef" class="scroll-mt-4">
    <h2 v-if="title" class="mb-6 font-title text-2xl font-semibold">
      {{ title }}
    </h2>
    <slot />
  </section>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';

export interface AppScrollSectionProps {
  /** Unique identifier for the section */
  id: string;
  /** Title of the section */
  title?: string;
}

const props = withDefaults(defineProps<AppScrollSectionProps>(), {
  title: '',
});

const emit = defineEmits<{
  (e: 'mounted', id: string, element: HTMLElement): void;
}>();

// Reference to the section element
const sectionRef = ref<HTMLElement | null>(null);

// Emit the section element when mounted
onMounted(() => {
  if (sectionRef.value) {
    emit('mounted', props.id, sectionRef.value);
  }
});

// Expose the section reference
defineExpose({
  sectionRef,
});
</script>
