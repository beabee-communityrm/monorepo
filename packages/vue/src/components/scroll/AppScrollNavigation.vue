<template>
  <div class="flex-0 basis-menu overflow-y-auto overflow-x-hidden">
    <div class="mb-4">
      <h2 v-if="title" class="mb-2 text-lg font-semibold">
        {{ title }}
      </h2>
      <div class="space-y-1">
        <button
          v-for="section in sections.filter((s) => !s.hidden)"
          :key="section.id"
          class="w-full overflow-hidden text-ellipsis whitespace-nowrap rounded-md px-3 py-2 text-left font-semibold transition-colors"
          :class="
            activeSection === section.id
              ? // TODO: reintroduce when scroll detection is fixed
                // ? 'bg-white font-medium text-primary shadow-sm'
                'text-body-80 hover:bg-primary-10 hover:text-body'
              : 'text-body-80 hover:bg-primary-10 hover:text-body'
          "
          :title="section.label"
          @click="scrollToSection(section.id)"
        >
          {{ section.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { watch } from 'vue';

/**
 * Section definition for scroll navigation
 */
export interface ScrollSection {
  /** Unique identifier for the section */
  id: string;
  /** Display label for the section */
  label: string;
  /** Whether this section should be hidden in the navigation */
  hidden?: boolean;
}

export interface AppScrollNavigationProps {
  /** Array of sections to display in the navigation */
  sections: ScrollSection[];
  /** Optional title for the navigation */
  title?: string;
}

const props = withDefaults(defineProps<AppScrollNavigationProps>(), {
  title: '',
});

const activeSection = defineModel<string>('activeSection');

/**
 * Scroll to a specific section
 */
function scrollToSection(sectionId: string): void {
  const section = props.sections.find((s) => s.id === sectionId);
  if (section) {
    document.getElementById('section-' + section.id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
    activeSection.value = sectionId;
  }
}

// Watch for changes in sections
watch(
  () => props.sections,
  () => {
    // If the active section is no longer in the list, select the first one
    if (
      props.sections.length > 0 &&
      !props.sections.some((s) => s.id === activeSection.value)
    ) {
      activeSection.value = props.sections[0].id;
    }
  },
  { deep: true }
);
</script>
