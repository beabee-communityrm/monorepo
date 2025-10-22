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
  expandNestedMergeFields,
  replaceMergeFields,
} from '@beabee/beabee-common';
import type { GetContactData } from '@beabee/beabee-common';
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
 * This component supports three different usage patterns:
 *
 * 1. Direct content editing (e.g., membership emails):
 *    - The `content` field contains the complete email body
 *    - Preview is rendered client-side from `content`
 *    - No `previewContent` or `mergeFields` props needed
 *
 * 2. Server-side merge field resolution (e.g., callout response emails):
 *    - The `content` field contains a merge field value (e.g., MESSAGE)
 *    - Preview is fetched from server with merge fields resolved
 *    - `previewContent` prop provides the server-rendered preview
 *    - `mergeFields` prop not needed in this mode
 *
 * 3. Client-side merge field expansion (NEW - no server request needed):
 *    - The `content` field contains merge tags like *|FNAME|*, *|EMAIL|*
 *    - `mergeFields` prop provides custom field values for live preview
 *    - `contact` prop enables automatic generation of contact-specific merge tags
 *    - `previewContent` prop not needed in this mode
 *    - Enables instant preview updates without server calls
 *    - Supports all standard contact merge tags: *|FNAME|*, *|LNAME|*, *|EMAIL|*, *|NAME|*, etc.
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
    /**
     * Merge fields for client-side preview expansion
     * When provided along with email content containing merge tags,
     * enables live preview without server requests.
     * Format: { FIELD_NAME: 'value' }
     */
    mergeFields?: Record<string, string>;
    /**
     * Contact data for generating contact-specific merge tags
     * When provided, enables preview of contact-specific merge tags like *|FNAME|*, *|LNAME|*, *|EMAIL|*
     */
    contact?: GetContactData | null;
    /** Label for subject input field */
    subjectLabel?: string;
    /** Label for content editor field */
    contentLabel?: string;
  }>(),
  {
    label: '',
    footer: '',
    previewContent: '',
    mergeFields: () => ({}),
    contact: undefined,
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
 * Generate all available contact merge tags based on contact data
 * This includes basic contact fields and computed fields
 */
function generateContactMergeTags(
  contact?: GetContactData | null
): Record<string, string> {
  if (!contact) return {};

  return {
    // Basic contact fields
    EMAIL: contact.email,
    FNAME: contact.firstname,
    LNAME: contact.lastname,

    // Contact ID
    ...(contact.id && { MEMBERSHIPID: contact.id }),
  };
}

/**
 * Computed property for email body preview
 * Supports three different usage patterns:
 *
 * 1. Server-rendered preview (previewContent provided)
 * 2. Client-side merge field expansion (mergeFields provided)
 * 3. Direct content editing (no merge fields)
 */
const emailBody = computed(() => {
  if (!props.email) return '';

  // Priority 1: Use server-rendered preview if available
  if (props.previewContent !== undefined && props.previewContent !== '') {
    return props.previewContent + (props.footer || '');
  }

  // Priority 2: Use client-side merge field expansion if merge fields or contact provided
  if (Object.keys(props.mergeFields).length > 0 || props.contact) {
    // Combine custom merge fields with contact merge tags
    const customMergeFields = { ...props.mergeFields };
    const contactMergeTags = generateContactMergeTags(props.contact);

    // Merge all fields together
    const allMergeFields = { ...contactMergeTags, ...customMergeFields };

    // First expand any nested merge fields within the merge field values
    const expandedFields = expandNestedMergeFields(allMergeFields);
    // Then replace merge fields in the content
    const expandedContent = replaceMergeFields(
      props.email.content,
      expandedFields
    );
    return expandedContent + (props.footer || '');
  }

  // Priority 3: Fall back to raw content for direct editing
  return props.email.content + (props.footer || '');
});
</script>
