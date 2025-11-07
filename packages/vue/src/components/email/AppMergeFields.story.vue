<script lang="ts" setup>
import { reactive, ref } from 'vue';

import type { MergeTagGroup } from '../../types/merge-fields';
import AppMergeFields from './AppMergeFields.vue';

const state = reactive({
  showCopy: true,
  showInsert: true,
  defaultExpanded: true,
});

// Example merge field groups for contact emails
const contactEmailGroups: MergeTagGroup[] = [
  {
    key: 'contact',
    tags: [
      { tag: 'EMAIL', example: 'user@example.com' },
      { tag: 'NAME', example: 'John Doe' },
      { tag: 'FNAME', example: 'John' },
      { tag: 'LNAME', example: 'Doe' },
    ],
  },
  {
    key: 'magic',
    tags: [{ tag: 'RPLINK' }, { tag: 'LOGINLINK' }, { tag: 'SPLINK' }],
  },
];

// Example merge field groups for callout response email
const calloutResponseGroups: MergeTagGroup[] = [
  {
    key: 'contact',
    tags: [
      { tag: 'EMAIL', example: 'user@example.com' },
      { tag: 'NAME', example: 'John Doe' },
      { tag: 'FNAME', example: 'John' },
      { tag: 'LNAME', example: 'Doe' },
    ],
  },
  {
    key: 'magic',
    tags: [{ tag: 'RPLINK' }, { tag: 'LOGINLINK' }, { tag: 'SPLINK' }],
  },
  {
    key: 'template',
    tags: [
      { tag: 'MESSAGE' },
      { tag: 'CALLOUTTITLE', example: 'Community Survey 2024' },
      {
        tag: 'CALLOUTLINK',
        example: 'https://example.com/crowdnewsroom/survey',
      },
      { tag: 'SUPPORTEMAIL', example: 'support@example.com' },
      { tag: 'ANSWERS' },
    ],
  },
];

// Example with minimal groups
const minimalGroups: MergeTagGroup[] = [
  {
    key: 'contact',
    tags: [{ tag: 'EMAIL' }, { tag: 'FNAME' }],
  },
];

// Event tracking
const lastInserted = ref<string>('');
const lastCopied = ref<string>('');
const insertCount = ref(0);
const copyCount = ref(0);

function handleInsert(tag: string) {
  lastInserted.value = tag;
  insertCount.value++;
}

function handleCopy(tag: string) {
  lastCopied.value = tag;
  copyCount.value++;
}
</script>

<template>
  <Story title="Email/AppMergeFields">
    <Variant title="Playground">
      <div class="flex gap-6">
        <div class="w-80 flex-none">
          <AppMergeFields
            :groups="calloutResponseGroups"
            :show-copy="state.showCopy"
            :show-insert="state.showInsert"
            :default-expanded="state.defaultExpanded"
            @insert="handleInsert"
            @copy="handleCopy"
          />
        </div>

        <div class="flex-1">
          <div class="rounded-lg border border-grey-light bg-grey-lighter p-4">
            <h4 class="mb-2 font-semibold text-body">Event Log</h4>
            <div class="space-y-2 text-sm">
              <p>
                <strong>Last inserted:</strong>
                {{ lastInserted || 'None' }}
              </p>
              <p>
                <strong>Last copied:</strong>
                {{ lastCopied || 'None' }}
              </p>
              <p>
                <strong>Insert count:</strong>
                {{ insertCount }}
              </p>
              <p>
                <strong>Copy count:</strong>
                {{ copyCount }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <template #controls>
        <HstCheckbox v-model="state.showCopy" title="Show Copy Button" />
        <HstCheckbox v-model="state.showInsert" title="Show Insert Button" />
        <HstCheckbox v-model="state.defaultExpanded" title="Default Expanded" />
      </template>
    </Variant>

    <Variant title="Callout Response Email">
      <div class="max-w-sm">
        <AppMergeFields
          :groups="calloutResponseGroups"
          @insert="handleInsert"
          @copy="handleCopy"
        />
      </div>
    </Variant>

    <Variant title="Contact Email (Basic)">
      <div class="max-w-sm">
        <AppMergeFields
          :groups="contactEmailGroups"
          @insert="handleInsert"
          @copy="handleCopy"
        />
      </div>
    </Variant>

    <Variant title="Copy Only (No Insert)">
      <div class="max-w-sm">
        <AppMergeFields
          :groups="contactEmailGroups"
          :show-copy="true"
          :show-insert="false"
          @copy="handleCopy"
        />
      </div>
    </Variant>

    <Variant title="Insert Only (No Copy)">
      <div class="max-w-sm">
        <AppMergeFields
          :groups="calloutResponseGroups"
          :show-copy="false"
          :show-insert="true"
          @insert="handleInsert"
        />
      </div>
    </Variant>

    <Variant title="Minimal Groups">
      <div class="max-w-sm">
        <AppMergeFields
          :groups="minimalGroups"
          @insert="handleInsert"
          @copy="handleCopy"
        />
      </div>
    </Variant>

    <Variant title="Initially Collapsed">
      <div class="max-w-sm">
        <AppMergeFields
          :groups="calloutResponseGroups"
          :default-expanded="false"
          @insert="handleInsert"
          @copy="handleCopy"
        />
      </div>
    </Variant>

    <Variant title="Dropdown Mode (No Toggle)">
      <div class="max-w-sm">
        <AppMergeFields
          :groups="calloutResponseGroups"
          :hide-toggle="true"
          :show-insert="true"
          :show-copy="false"
          @insert="handleInsert"
        />
      </div>
    </Variant>

    <Variant title="In Email Editor Context">
      <div class="bg-grey-lighter p-6">
        <div class="flex gap-6">
          <!-- Simulated editor -->
          <div class="min-w-0 flex-1">
            <div class="rounded-lg border border-grey-light bg-white p-4">
              <h3 class="mb-4 font-semibold text-body">Email Content Editor</h3>
              <div
                class="min-h-[200px] rounded border border-grey bg-grey-lighter p-3"
              >
                <p class="text-sm text-body-60">
                  Click insert on merge fields to add them to your email...
                </p>
                <p v-if="lastInserted" class="mt-2 text-sm text-body">
                  Last inserted:
                  <code class="rounded bg-white px-1"
                    >*|{{ lastInserted }}|*</code
                  >
                </p>
              </div>
            </div>
          </div>

          <!-- Merge fields sidebar -->
          <div class="w-80 flex-none">
            <AppMergeFields
              :groups="calloutResponseGroups"
              :show-insert="true"
              :show-copy="true"
              @insert="handleInsert"
              @copy="handleCopy"
            />
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
