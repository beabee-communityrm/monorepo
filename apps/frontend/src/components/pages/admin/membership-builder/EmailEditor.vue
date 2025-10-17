<template>
  <div>
    <AppSubHeading v-if="label">{{ label }}</AppSubHeading>
    <template v-if="email">
      <div class="mb-6 flex gap-6">
        <!-- Left column: Email editor (takes available space, max width) -->
        <div class="min-w-0 max-w-xl flex-1">
          <div class="mb-4">
            <AppInput v-model="email.subject" :label="subjectLabel" required />
          </div>
          <AppRichTextEditor
            v-model="email.content"
            :label="contentLabel"
            required
          />
        </div>

        <!-- Right column: Preview (responsive width, vertically centered) -->
        <div class="w-80 flex-none self-center lg:w-96">
          <div class="content-message bg-white p-4 shadow" v-html="emailBody" />
        </div>
      </div>
    </template>
    <AppNotification v-else variant="warning" title="Can't edit email">
      <p>
        This email is managed by your email provider, you can't edit it here
      </p>
    </AppNotification>
  </div>
</template>
<script lang="ts" setup>
import {
  AppInput,
  AppNotification,
  AppRichTextEditor,
  AppSubHeading,
} from '@beabee/vue';

import { computed, ref, watch } from 'vue';

/**
 * EmailEditor component for editing email templates
 *
 * This component supports two different usage patterns:
 *
 * 1. Direct content editing (e.g., membership emails):
 *    - The `content` field contains the complete email body
 *    - Preview is rendered client-side from `content`
 *    - No `previewContent` prop needed
 *
 * 2. Template with merge fields (e.g., callout response emails):
 *    - The `content` field contains a merge field value (e.g., MESSAGE)
 *    - Preview is fetched from server with merge fields resolved
 *    - `previewContent` prop provides the server-rendered preview
 */

const props = withDefaults(
  defineProps<{
    /** Optional heading label */
    label?: string;
    /**
     * Email data to edit
     * - content: The editable content (full body or merge field value)
     * - subject: The email subject line
     * Set to false when email is managed externally
     */
    email: { content: string; subject: string } | false;
    /** Optional footer to append to preview */
    footer?: string;
    /**
     * Optional server-rendered preview content
     * When provided, this will be used instead of the raw content for preview.
     * This is useful when the content contains merge fields that need to be
     * resolved server-side.
     */
    previewContent?: string;
    /** Label for subject input field */
    subjectLabel?: string;
    /** Label for content editor field */
    contentLabel?: string;
  }>(),
  {
    label: '',
    footer: '',
    previewContent: '',
    subjectLabel: '',
    contentLabel: '',
  }
);

// Local ref to allow mutation of email data
const email = ref(props.email);

// Sync local ref with props when props change
watch(
  () => props.email,
  (newEmail) => {
    email.value = newEmail;
  }
);

/**
 * Computed property for email body preview
 * Uses previewContent if available (server-rendered with merge fields),
 * otherwise falls back to the raw content (direct body editing)
 */
const emailBody = computed(
  () =>
    props.email &&
    (props.previewContent !== undefined && props.previewContent !== ''
      ? props.previewContent
      : props.email.content) + (props.footer || '')
);
</script>
