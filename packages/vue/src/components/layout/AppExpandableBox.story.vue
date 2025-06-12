<script lang="ts" setup>
import {
  faBookmark,
  faDownload,
  faShare,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { reactive, ref } from 'vue';

import AppExpandableBox from './AppExpandableBox.vue';

const state = reactive({
  buttonText: 'Show Details',
  expanded: false,
  showIcon: true,
});

const icons = [
  { name: 'Share', icon: faShare },
  { name: 'Download', icon: faDownload },
  { name: 'Bookmark', icon: faBookmark },
  { name: 'User', icon: faUser },
];

const expandedCount = ref(0);

function handleExpand() {
  expandedCount.value++;
}
</script>

<template>
  <Story title="Components/Layout/AppExpandableBox">
    <Variant title="Playground">
      <div class="max-w-lg">
        <AppExpandableBox
          v-model:expanded="state.expanded"
          :button-icon="faShare"
          :button-text="state.buttonText"
          @update:expanded="handleExpand"
        >
          <template #before>
            <div class="text-sm text-body-80">Optional before content</div>
          </template>

          <div class="space-y-3">
            <h3 class="text-lg font-semibold">Expandable Content</h3>
            <p>
              This content is hidden by default and shows when the box is
              expanded.
            </p>
            <div class="rounded bg-grey-lighter p-3">
              <p class="text-sm">Additional information can be placed here.</p>
            </div>
            <ul class="list-disc pl-4">
              <li>Feature 1</li>
              <li>Feature 2</li>
              <li>Feature 3</li>
            </ul>
          </div>
        </AppExpandableBox>

        <p class="mt-4 text-sm text-body-80">
          Expanded {{ expandedCount }} times
        </p>
      </div>

      <template #controls>
        <HstText v-model="state.buttonText" title="Button Text" />
        <HstCheckbox v-model="state.expanded" title="Expanded" />
        <HstCheckbox v-model="state.showIcon" title="Show Icon" />
      </template>
    </Variant>

    <Variant title="Different Icons">
      <div class="space-y-4">
        <AppExpandableBox
          v-for="iconData in icons"
          :key="iconData.name"
          :button-icon="iconData.icon"
          :button-text="`${iconData.name} Options`"
        >
          <p>Content for {{ iconData.name }} section.</p>
          <p class="text-sm text-body-80">
            This demonstrates different icons in the expandable box.
          </p>
        </AppExpandableBox>
      </div>
    </Variant>

    <Variant title="With Before Slot">
      <div class="max-w-lg">
        <AppExpandableBox button-text="Advanced Settings" :button-icon="faUser">
          <template #before>
            <div
              class="text-warning-80 rounded bg-warning-10 px-2 py-1 text-xs"
            >
              Admin Only
            </div>
          </template>

          <div class="space-y-3">
            <h4 class="font-medium">Administrator Settings</h4>
            <p>These settings are only available to administrators.</p>
            <div class="grid grid-cols-2 gap-2">
              <button class="rounded border p-2 text-sm hover:bg-grey-lighter">
                Setting 1
              </button>
              <button class="rounded border p-2 text-sm hover:bg-grey-lighter">
                Setting 2
              </button>
            </div>
          </div>
        </AppExpandableBox>
      </div>
    </Variant>

    <Variant title="Multiple Boxes">
      <div class="space-y-2">
        <AppExpandableBox
          button-text="Personal Information"
          :button-icon="faUser"
        >
          <div class="space-y-2">
            <div class="flex justify-between">
              <span>Name:</span>
              <span>John Doe</span>
            </div>
            <div class="flex justify-between">
              <span>Email:</span>
              <span>john@example.com</span>
            </div>
          </div>
        </AppExpandableBox>

        <AppExpandableBox button-text="Share Options" :button-icon="faShare">
          <div class="flex gap-2">
            <button class="bg-blue-500 rounded px-3 py-1 text-white">
              Twitter
            </button>
            <button class="bg-blue-600 rounded px-3 py-1 text-white">
              Facebook
            </button>
            <button class="bg-green-600 rounded px-3 py-1 text-white">
              WhatsApp
            </button>
          </div>
        </AppExpandableBox>

        <AppExpandableBox
          button-text="Download Options"
          :button-icon="faDownload"
        >
          <div class="space-y-2">
            <a href="#" class="block text-link hover:underline">
              Download PDF
            </a>
            <a href="#" class="block text-link hover:underline">
              Download Excel
            </a>
            <a href="#" class="block text-link hover:underline">
              Download CSV
            </a>
          </div>
        </AppExpandableBox>
      </div>
    </Variant>
  </Story>
</template>
