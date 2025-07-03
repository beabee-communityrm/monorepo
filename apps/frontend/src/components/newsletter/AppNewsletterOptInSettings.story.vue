<script lang="ts" setup>
import type { NewsletterGroupData } from '@beabee/beabee-common';

import { ref } from 'vue';

import AppNewsletterOptInSettings from './AppNewsletterOptInSettings.vue';

const title = ref('Subscribe to Our Newsletter');
const text = ref('<p>Stay informed about our latest updates and news.</p>');
const optIn = ref('Yes, I want to receive newsletters');
const groups = ref<NewsletterGroupData[]>([
  { id: 'news', label: 'Company News', checked: true },
  { id: 'events', label: 'Events & Workshops', checked: false },
]);

const showGroups = ref(true);

// Empty state refs for the Empty State variant
const emptyTitle = ref('');
const emptyText = ref('');
const emptyOptIn = ref('');
const emptyGroups = ref<NewsletterGroupData[]>([]);

// Simple configuration variant refs
const simpleGroups = ref<NewsletterGroupData[]>([]);

function toggleGroups() {
  showGroups.value = !showGroups.value;
  if (!showGroups.value) {
    groups.value = [];
  } else {
    groups.value = [
      { id: 'news', label: 'Company News', checked: true },
      { id: 'events', label: 'Events & Workshops', checked: false },
    ];
  }
}
</script>

<template>
  <Story title="Newsletter/AppNewsletterOptInSettings">
    <Variant title="Playground">
      <div class="max-w-4xl">
        <div class="mb-6 rounded border bg-grey-lighter p-4">
          <h3 class="mb-2 font-semibold">Newsletter Configuration</h3>
          <p class="text-sm text-body-80">
            Configure how the newsletter opt-in appears to users. All labels are
            now internally localized.
          </p>
        </div>

        <AppNewsletterOptInSettings
          v-model:title="title"
          v-model:text="text"
          v-model:opt-in="optIn"
          v-model:groups="groups"
        />

        <div class="mt-8 rounded border bg-primary-5 p-4">
          <h4 class="mb-3 font-semibold text-primary-80">Preview Output</h4>
          <div class="space-y-2 text-sm">
            <div><strong>Title:</strong> {{ title }}</div>
            <div><strong>Text:</strong> <span v-html="text" /></div>
            <div><strong>Opt-in:</strong> {{ optIn }}</div>
            <div><strong>Groups:</strong></div>
            <ul v-if="groups.length > 0" class="ml-4 list-disc">
              <li v-for="group in groups" :key="group.id">
                {{ group.label }} ({{ group.id }})
                <span v-if="group.checked" class="text-success-80"
                  >- Default</span
                >
              </li>
            </ul>
            <div v-else class="ml-4 text-body-60">No groups configured</div>
          </div>
        </div>
      </div>

      <template #controls>
        <HstButton title="Toggle Groups" @click="toggleGroups">
          {{ showGroups ? 'Remove Groups' : 'Add Groups' }}
        </HstButton>
      </template>
    </Variant>

    <Variant title="Simple Configuration">
      <div class="max-w-2xl">
        <AppNewsletterOptInSettings
          v-model:title="title"
          v-model:text="text"
          v-model:opt-in="optIn"
          v-model:groups="simpleGroups"
        />
      </div>
    </Variant>

    <Variant title="With Groups">
      <div class="max-w-2xl">
        <AppNewsletterOptInSettings
          v-model:title="title"
          v-model:text="text"
          v-model:opt-in="optIn"
          v-model:groups="groups"
        />
      </div>
    </Variant>

    <Variant title="Empty State">
      <div class="max-w-2xl">
        <AppNewsletterOptInSettings
          v-model:title="emptyTitle"
          v-model:text="emptyText"
          v-model:opt-in="emptyOptIn"
          v-model:groups="emptyGroups"
        />
      </div>
    </Variant>

    <Variant title="Accessibility Features">
      <div class="max-w-2xl">
        <div class="bg-info-10 mb-4 rounded border p-4">
          <h4 class="text-info-80 mb-2 font-semibold">
            Accessibility Features
          </h4>
          <ul class="text-info-70 list-disc pl-4 text-sm">
            <li>All form fields have proper labels</li>
            <li>Required fields are marked appropriately</li>
            <li>Disabled states are clearly indicated</li>
            <li>Rich text editor has full keyboard navigation</li>
            <li>Help text provides context for complex features</li>
            <li>Uses internal i18n for consistent translations</li>
          </ul>
        </div>

        <AppNewsletterOptInSettings
          v-model:title="title"
          v-model:text="text"
          v-model:opt-in="optIn"
          v-model:groups="groups"
        />
      </div>
    </Variant>
  </Story>
</template>
