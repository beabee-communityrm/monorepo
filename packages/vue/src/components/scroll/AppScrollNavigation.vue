<template>
  <div class="flex-0 basis-menu overflow-y-auto">
    <div class="mb-4">
      <h2 v-if="title" class="mb-2 text-lg font-semibold">
        {{ title }}
      </h2>
      <div class="space-y-2">
        <button
          v-for="section in sections"
          :key="section.id"
          class="w-full rounded-md border px-3 py-2 text-left text-sm transition-colors"
          :class="
            activeSection === section.id
              ? 'border-primary bg-primary-5 font-medium text-primary'
              : 'border-primary-20 hover:border-primary-40'
          "
          @click="scrollToSection(section.id)"
        >
          {{ section.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

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

const emit = defineEmits<{
  (e: 'update:activeSection', sectionId: string): void;
  (e: 'section-change', sectionId: string): void;
}>();

// Currently active section
const activeSection = ref<string>(
  props.sections.length > 0 ? props.sections[0].id : ''
);

/**
 * Scroll to a specific section
 */
function scrollToSection(sectionId: string): void {
  const section = props.sections.find((s) => s.id === sectionId);
  if (section && section.element) {
    section.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    activeSection.value = sectionId;
    emit('update:activeSection', sectionId);
    emit('section-change', sectionId);
  }
}

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
        emit('update:activeSection', section.id);
        emit('section-change', section.id);
      }
      break;
    }
  }
}

// Set up scroll event listener
onMounted(() => {
  const scrollTarget = props.scrollContainer || window;
  scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
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
      emit('update:activeSection', activeSection.value);
    }

    // Schedule a check for the active section after the DOM has updated
    setTimeout(handleScroll, 100);
  },
  { deep: true }
);

// Expose methods and properties
defineExpose({
  scrollToSection,
  activeSection,
});
</script>
