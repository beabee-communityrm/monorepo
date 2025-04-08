<template>
  <section :id="'section-' + id" class="scroll-mt-4">
    <h2 v-if="title" class="mb-6 font-title text-2xl font-semibold">
      {{ title }}
    </h2>
    <slot />
  </section>
</template>

<script lang="ts" setup>
export interface AppScrollSectionProps {
  /** Unique identifier for the section */
  id: string;
  /** Title of the section */
  title?: string;
}

withDefaults(defineProps<AppScrollSectionProps>(), {
  title: '',
});
</script>
