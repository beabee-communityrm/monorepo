<script lang="ts" setup>
import type { NewsletterGroupData } from '@beabee/beabee-common';

import { reactive, ref } from 'vue';

import AppNewsletterOptIn from './AppNewsletterOptIn.vue';

// Mock newsletter groups
const mockGroups: NewsletterGroupData[] = [
  { id: 'general', label: 'General Newsletter', checked: true },
  { id: 'events', label: 'Event Announcements', checked: false },
  { id: 'updates', label: 'Product Updates', checked: false },
  { id: 'community', label: 'Community News', checked: true },
];

const state = reactive({
  title: 'Newsletter Subscription',
  text: '<p>Stay up to date with our latest news and updates by subscribing to our newsletter.</p>',
  optIn: 'Yes, I would like to receive the newsletter',
  groups: [] as NewsletterGroupData[],
  showGroups: false,
});

const optInStatus = ref(false);
const optInGroups = ref<string[]>([]);

// Toggle between simple and group modes
function toggleGroupMode() {
  state.showGroups = !state.showGroups;
  state.groups = state.showGroups ? [...mockGroups] : [];
  // Reset selections when switching modes
  optInStatus.value = false;
  optInGroups.value = [];
}
</script>

<template>
  <Story title="Newsletter/AppNewsletterOptIn">
    <Variant title="Playground">
      <div class="max-w-lg">
        <AppNewsletterOptIn
          v-model="optInStatus"
          v-model:opt-in-groups="optInGroups"
          :title="state.title"
          :text="state.text"
          :opt-in="state.optIn"
          :groups="state.groups"
        />

        <div class="mt-6 rounded border bg-grey-lighter p-4">
          <h4 class="mb-2 font-semibold">Current State:</h4>
          <p><strong>Opt-in Status:</strong> {{ optInStatus }}</p>
          <p>
            <strong>Selected Groups:</strong>
            {{ optInGroups.join(', ') || 'None' }}
          </p>
        </div>
      </div>

      <template #controls>
        <HstText v-model="state.title" title="Title" />
        <HstTextarea v-model="state.text" title="Text Content (HTML)" />
        <HstText v-model="state.optIn" title="Opt-in Label" />

        <HstButton title="Toggle Group Mode" @click="toggleGroupMode">
          {{
            state.showGroups ? 'Switch to Simple Mode' : 'Switch to Group Mode'
          }}
        </HstButton>
      </template>
    </Variant>

    <Variant title="Simple Opt-in">
      <div class="max-w-lg space-y-6">
        <AppNewsletterOptIn
          v-model="optInStatus"
          title="Newsletter Subscription"
          text="<p>Subscribe to our newsletter to receive updates about our latest features and news.</p>"
          opt-in="Yes, I want to receive the newsletter"
          :groups="[]"
        />
      </div>
    </Variant>

    <Variant title="Multi-group Selection">
      <div class="max-w-lg space-y-6">
        <AppNewsletterOptIn
          v-model="optInStatus"
          v-model:opt-in-groups="optInGroups"
          title="Choose Your Subscriptions"
          text="<p>Select which types of updates you'd like to receive:</p>"
          opt-in="Subscribe to newsletter"
          :groups="mockGroups"
        />
      </div>
    </Variant>

    <Variant title="Rich Text Content">
      <div class="max-w-lg space-y-6">
        <AppNewsletterOptIn
          v-model="optInStatus"
          title="Community Updates"
          text="<p>Join our community and stay informed about:</p><ul><li>📢 Major announcements</li><li>🎉 Events and workshops</li><li>💡 Tips and tutorials</li><li>🤝 Community highlights</li></ul><p><strong>We respect your privacy</strong> and you can unsubscribe at any time.</p>"
          opt-in="Count me in!"
          :groups="[]"
        />
      </div>
    </Variant>

    <Variant title="Minimal Setup">
      <div class="max-w-lg space-y-6">
        <AppNewsletterOptIn
          v-model="optInStatus"
          title="Quick Subscribe"
          text="Get our newsletter"
          opt-in="Subscribe"
          :groups="[]"
        />
      </div>
    </Variant>

    <Variant title="Accessibility Focus">
      <div class="max-w-lg space-y-6">
        <AppNewsletterOptIn
          v-model="optInStatus"
          v-model:opt-in-groups="optInGroups"
          title="Newsletter Preferences"
          text="<p>Choose your newsletter preferences below. All fields are optional.</p>"
          opt-in="Subscribe to general newsletter"
          :groups="mockGroups"
          groups-aria-label="Available newsletter subscriptions"
        />

        <div class="mt-4 text-sm text-body-80">
          <p>
            <strong>Accessibility note:</strong> This variant demonstrates
            proper ARIA labeling for screen readers.
          </p>
        </div>
      </div>
    </Variant>
  </Story>
</template>
