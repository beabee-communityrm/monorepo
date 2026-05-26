<script lang="ts" setup>
import { ref } from 'vue';

import type { MergeTagGroup } from '../../types/merge-fields';
import AppMergeFields from './AppMergeFields.vue';

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

// Event tracking
const lastInserted = ref<string>('');
const insertCount = ref(0);

function handleInsert(tag: string) {
  lastInserted.value = tag;
  insertCount.value++;
}
</script>

<template>
  <Story title="Email/AppMergeFields">
    <Variant title="Dropdown Mode">
      <div class="flex gap-6">
        <div class="w-80 flex-none">
          <AppMergeFields
            :groups="calloutResponseGroups"
            @insert="handleInsert"
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
                <strong>Insert count:</strong>
                {{ insertCount }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Variant>

    <Variant title="In Rich Text Editor Context">
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

          <!-- Merge fields dropdown -->
          <div class="w-80 flex-none">
            <AppMergeFields
              :groups="calloutResponseGroups"
              @insert="handleInsert"
            />
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
