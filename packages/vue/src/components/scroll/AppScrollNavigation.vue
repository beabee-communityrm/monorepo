<template>
  <div class="flex-0 basis-menu overflow-y-auto overflow-x-hidden">
    <div class="mb-4">
      <h2 v-if="title" class="mb-2 text-lg font-semibold">
        {{ title }}
      </h2>
      <AppVTabs
        v-model="activeSection"
        :items="sections.filter((s) => !s.hidden)"
        :title="title"
        class="mb-4"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import AppVTabs from '../tabs/AppVTabs.vue';

/**
 * Section definition for scroll navigation
 */
export interface ScrollSection {
  /** Unique identifier for the section */
  id: string;
  /** Display label for the section */
  label: string;
  /** Optional element reference for scrolling */
  element?: HTMLElement;
  /** Whether this section should be hidden in the navigation */
  hidden?: boolean;
}

export interface AppScrollNavigationProps {
  /** Array of sections to display in the navigation */
  sections: ScrollSection[];
  /** Optional title for the navigation */
  title?: string;
  /** Optional container element to listen for scroll events */
  scrollContainer?: HTMLElement | null;
}

const props = withDefaults(defineProps<AppScrollNavigationProps>(), {
  title: '',
  scrollContainer: null,
});

const activeSection = defineModel<string | undefined>('activeSection');

/**
 * Update active section based on scroll position
 */
function handleScroll(): void {
  // Find all sections with elements
  const sectionsWithElements = props.sections.filter((s) => s.element);

  if (sectionsWithElements.length === 0) return;

  // Find the section that is currently in view
  // We use a small offset to improve the detection
  const offset = 100;

  for (const section of sectionsWithElements) {
    if (!section.element) continue;

    const rect = section.element.getBoundingClientRect();
    if (rect.top <= offset && rect.bottom > offset) {
      if (activeSection.value !== section.id) {
        activeSection.value = section.id;
      }
      break;
    }
  }
}

// Set up scroll event listener
onMounted(() => {
  const scrollTarget = props.scrollContainer || window;
  // scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
  if (!activeSection.value) {
    activeSection.value = props.sections[0].id;
  }
});

onUnmounted(() => {
  const scrollTarget = props.scrollContainer || window;
  scrollTarget.removeEventListener('scroll', handleScroll);
});

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

    // Schedule a check for the active section after the DOM has updated
    // setTimeout(handleScroll, 100);
  },
  { deep: true }
);

watch(activeSection, (newSection) => {
  const section = props.sections.find((s) => s.id === newSection);
  if (section && section.element) {
    section.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});
</script>
