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
          <div class="content-message bg-white p-4 shadow">
            <div
              v-if="apiPreview && isLoadingPreview"
              class="text-gray-500 flex items-center justify-center p-8"
            >
              <div
                class="border-gray-900 mr-2 h-6 w-6 animate-spin rounded-full border-b-2"
              ></div>
              Loading preview...
            </div>
            <div
              v-else-if="apiPreview && !apiPreviewResult"
              class="text-gray-500 flex items-center justify-center p-8"
            >
              Preview unavailable
            </div>
            <div v-else v-html="emailBody" />
          </div>
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

import { client } from '@utils/api';
import { computed, ref, watch } from 'vue';

/**
 * EmailEditor component for editing email templates
 *
 * This component supports three different usage patterns with priority order:
 *
 * 0. API-based server preview (HIGHEST PRIORITY):
 *    - The `content` field contains a merge field value (e.g., MESSAGE)
 *    - `apiPreview` prop configures server-side preview with merge field resolution
 *    - `mergeFields` prop provides custom merge fields sent to the server API
 *    - Preview is fetched from API with full template rendering
 *    - Perfect for complex email templates requiring server processing
 *    - All merge fields (mergeFields + contact data) are sent to server
 *
 * 1. Client-side merge field expansion:
 *    - The `content` field contains merge tags like *|FNAME|*, *|EMAIL|*
 *    - `mergeFields` prop provides custom field values for live preview
 *    - `contact` prop enables automatic generation of contact-specific merge tags
 *    - Enables instant preview updates without server calls
 *    - Supports all standard contact merge tags: *|FNAME|*, *|LNAME|*, *|EMAIL|*, *|NAME|*, etc.
 *
 * 2. Direct content editing (LOWEST PRIORITY):
 *    - The `content` field contains the complete email body
 *    - Preview is rendered client-side from `content`
 *    - No `mergeFields`, `contact`, or `apiPreview` props needed
 *
 * UNIFIED MERGE FIELDS:
 * The `mergeFields` prop provides a unified interface for both client-side and server-side rendering.
 * When `apiPreview` is enabled, mergeFields are sent to the server API.
 * When `apiPreview` is disabled, mergeFields are used for client-side expansion.
 * Contact data (via `contact` prop) is automatically merged with custom mergeFields.
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
     * @deprecated Use apiPreview prop instead for server-side preview
     * Optional server-rendered preview content for legacy compatibility
     */
    previewContent?: string;
    /**
     * Merge fields for both client-side and server-side preview
     * When `apiPreview` is enabled, these are sent to the server API.
     * When `apiPreview` is disabled, these are used for client-side expansion.
     * Contact data (via `contact` prop) is automatically merged with these fields.
     * Format: { FIELD_NAME: 'value' }
     */
    mergeFields?: Record<string, string>;
    /**
     * Contact data for generating contact-specific merge tags
     * When provided, enables preview of contact-specific merge tags like *|FNAME|*, *|LNAME|*, *|EMAIL|*
     */
    contact?: GetContactData | null;
    /**
     * API-based preview configuration
     * When provided, enables server-side preview with merge field resolution.
     * Use `mergeFields` prop to provide custom merge fields sent to the server.
     */
    apiPreview?: {
      /** Email type identifier (e.g., 'contact', 'welcome') */
      type: string;
      /** Template identifier for the email (e.g., 'callout-response-answers') */
      templateId?: string;
    };
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
    apiPreview: undefined,
    subjectLabel: '',
    contentLabel: '',
  }
);

// Local ref to allow mutation of email data
const email = ref(props.email);

// API preview result cache
const apiPreviewResult = ref<{ subject: string; body: string } | null>(null);
const isLoadingPreview = ref(false);

// Sync local ref with props when props change
watch(
  () => props.email,
  (newEmail) => {
    email.value = newEmail;
  }
);

// Watch for API preview configuration changes
watch(
  () => props.apiPreview,
  () => {
    if (props.apiPreview) {
      loadApiPreview();
    } else {
      apiPreviewResult.value = null;
    }
  },
  { immediate: true }
);

// Watch for email content changes when API preview is enabled
watch(
  [() => email.value, () => props.mergeFields, () => props.contact],
  () => {
    if (props.apiPreview && email.value) {
      loadApiPreview();
    }
  },
  { deep: true }
);

/**
 * Load email preview from API with merge fields resolved
 */
async function loadApiPreview() {
  if (!props.apiPreview || !email.value) return;

  const emailData = email.value as { content: string; subject: string };
  const allMergeFields = generateAllMergeFields();
  isLoadingPreview.value = true;

  try {
    const preview = await client.email.preview(
      props.apiPreview.type as 'contact' | 'general' | 'admin',
      props.apiPreview.templateId || props.apiPreview.type,
      {
        mergeFields: {
          MESSAGE: emailData.content,
          ...allMergeFields,
        },
        customSubject: emailData.subject,
      }
    );

    apiPreviewResult.value = {
      subject: preview.subject,
      body: preview.body,
    };
  } catch {
    // Failed to load preview, component will show fallback content
    apiPreviewResult.value = null;
  } finally {
    isLoadingPreview.value = false;
  }
}

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
 * Generate all available merge fields by combining custom mergeFields with contact data
 * This provides a unified interface for both client-side and server-side merge field handling
 */
function generateAllMergeFields(): Record<string, string> {
  // Start with custom merge fields from props
  const customMergeFields = { ...props.mergeFields };
  // Add contact merge tags
  const contactMergeTags = generateContactMergeTags(props.contact);

  // Merge all fields together (custom fields override contact fields if they conflict)
  return { ...contactMergeTags, ...customMergeFields };
}

/**
 * Computed property for email body preview
 * Supports three different usage patterns with priority order:
 *
 * 0. API-based preview (apiPreview provided) - HIGHEST PRIORITY
 * 1. Client-side merge field expansion (mergeFields provided)
 * 2. Direct content editing (no merge fields) - LOWEST PRIORITY
 */
const emailBody = computed(() => {
  if (!props.email) return '';

  // Priority 0: Use API-based preview if available and loaded
  if (props.apiPreview && apiPreviewResult.value) {
    return apiPreviewResult.value.body + (props.footer || '');
  }

  // Priority 1: Use client-side merge field expansion if merge fields or contact provided
  const allMergeFields = generateAllMergeFields();
  if (Object.keys(allMergeFields).length > 0) {
    // First expand any nested merge fields within the merge field values
    const expandedFields = expandNestedMergeFields(allMergeFields);
    // Then replace merge fields in the content
    const expandedContent = replaceMergeFields(
      props.email.content,
      expandedFields
    );
    return expandedContent + (props.footer || '');
  }

  // Priority 2: Fall back to raw content for direct editing
  return props.email.content + (props.footer || '');
});
</script>
