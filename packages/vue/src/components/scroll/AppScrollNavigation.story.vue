<script lang="ts" setup>
import { reactive, ref } from 'vue';

import AppFormBox from '../form/AppFormBox.vue';
import AppScrollNavigation from './AppScrollNavigation.vue';
import type { ScrollSection } from './AppScrollNavigation.vue';
import AppScrollSection from './AppScrollSection.vue';

// Example sections
const sections: ScrollSection[] = [
  { id: 'section1', label: 'Section 1' },
  { id: 'section2', label: 'Section 2' },
  { id: 'section3', label: 'Section 3' },
  {
    id: 'section4',
    label: 'Section 4 with a very long name that should be truncated',
  },
];

// State for the active section
const state = reactive({
  activeSection: 'section1',
});

// Container reference for scroll events
const containerRef = ref<HTMLElement | null>(null);
</script>

<template>
  <Story title="Components/Scroll/AppScrollNavigation">
    <Variant title="Basic Usage">
      <div class="flex gap-4">
        <AppScrollNavigation
          :sections="sections"
          title="Navigation"
          v-model:activeSection="state.activeSection"
        />

        <div
          class="h-[500px] flex-1 overflow-y-auto border border-primary-20 p-4"
        >
          <h1 class="mb-4 text-2xl font-bold">Scroll Content</h1>
          <p class="mb-4">
            Scroll down to see how the navigation highlights the current
            section.
          </p>

          <AppScrollSection id="section1">
            <AppFormBox title="Section 1">
              <p class="mb-4">This is the content of section 1.</p>
              <p class="mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
                euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc,
                quis aliquam nisl nunc quis nisl.
              </p>
            </AppFormBox>
          </AppScrollSection>

          <AppScrollSection id="section2">
            <AppFormBox title="Section 2">
              <p class="mb-4">This is the content of section 2.</p>
              <p class="mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
                euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc,
                quis aliquam nisl nunc quis nisl.
              </p>
            </AppFormBox>
          </AppScrollSection>

          <AppScrollSection id="section3">
            <AppFormBox title="Section 3">
              <p class="mb-4">This is the content of section 3.</p>
              <p class="mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
                euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc,
                quis aliquam nisl nunc quis nisl.
              </p>
            </AppFormBox>
          </AppScrollSection>

          <AppScrollSection id="section4">
            <AppFormBox
              title="Section 4 with a very long name that should be truncated"
            >
              <p class="mb-4">This is the content of section 4.</p>
              <p class="mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
                euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc,
                quis aliquam nisl nunc quis nisl.
              </p>
            </AppFormBox>
          </AppScrollSection>
        </div>
      </div>
    </Variant>

    <Variant title="With Custom Container">
      <div class="flex gap-4">
        <AppScrollNavigation
          :sections="sections"
          title="Navigation"
          v-model:activeSection="state.activeSection"
        />

        <div
          ref="containerRef"
          class="h-[500px] flex-1 overflow-y-auto border border-primary-20 p-4"
        >
          <h1 class="mb-4 text-2xl font-bold">Custom Container</h1>
          <p class="mb-4">This example uses a custom scroll container.</p>

          <AppScrollSection id="section1">
            <AppFormBox title="Section 1">
              <p class="mb-4">This is the content of section 1.</p>
              <p class="mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
                euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc,
                quis aliquam nisl nunc quis nisl.
              </p>
            </AppFormBox>
          </AppScrollSection>

          <AppScrollSection id="section2">
            <AppFormBox title="Section 2">
              <p class="mb-4">This is the content of section 2.</p>
              <p class="mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
                euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc,
                quis aliquam nisl nunc quis nisl.
              </p>
            </AppFormBox>
          </AppScrollSection>

          <AppScrollSection id="section3">
            <AppFormBox title="Section 3">
              <p class="mb-4">This is the content of section 3.</p>
              <p class="mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
                euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc,
                quis aliquam nisl nunc quis nisl.
              </p>
            </AppFormBox>
          </AppScrollSection>

          <AppScrollSection id="section4">
            <AppFormBox
              title="Section 4 with a very long name that should be truncated"
            >
              <p class="mb-4">This is the content of section 4.</p>
              <p class="mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
                euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc,
                quis aliquam nisl nunc quis nisl.
              </p>
            </AppFormBox>
          </AppScrollSection>
        </div>
      </div>
    </Variant>
  </Story>
</template>
