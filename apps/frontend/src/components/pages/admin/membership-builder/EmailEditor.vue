<template>
  <div>
    <AppSubHeading v-if="heading">{{ heading }}</AppSubHeading>
    <div
      class="relative mb-6 flex flex-col gap-6"
      :class="alwaysStacked ? '' : 'md:flex-row'"
    >
      <!-- Editor panel -->
      <div class="relative min-w-0 flex-1">
        <div class="mb-4">
          <AppInput
            v-model="subject"
            :label="subjectLabel || t('emailEditor.subject.label')"
            required
          />
        </div>
        <AppRichTextEditor
          v-model="content"
          :label="contentLabel || t('emailEditor.body.label')"
          :merge-fields="mergeFieldGroups"
          required
        />
      </div>

      <!-- Preview panel -->
      <div class="w-full" :class="alwaysStacked ? '' : 'md:w-[600px]'">
        <AppLabel :label="t('emailEditor.preview.label')" class="mb-0.5" />
        <div
          class="content-message rounded border border-primary-40 bg-white p-4"
        >
          <!-- Loading state -->
          <div
            v-if="isLoadingPreview"
            class="text-gray-500 flex items-center justify-center p-8"
          >
            <div
              class="border-gray-900 mr-2 h-6 w-6 animate-spin rounded-full border-b-2"
            ></div>
            {{ t('common.loading') }}
          </div>

          <!-- Error state -->
          <div
            v-else-if="!serverPreviewResult"
            class="text-gray-500 flex items-center justify-center p-8"
          >
            {{ t('emailEditor.preview.unavailable') }}
          </div>

          <!-- Preview content (server-rendered with footer and CSS) -->
          <div v-else v-html="serverPreviewResult.body" />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
/**
 * EmailEditor component for editing and previewing email templates
 *
 * This component provides server-side email preview that matches exactly
 * what will be sent via email, including:
 * - Merge field replacement (contact fields, template-specific fields, custom fields)
 * - Email footer with organization info, logo, and links
 * - Inline CSS styles for consistent email client rendering
 *
 * The preview is fetched from the server API and debounced to prevent
 * excessive API calls during editing.
 *
 * @example Basic usage for contact email template
 * ```vue
 * <EmailEditor
 *   v-model:subject="emailSubject"
 *   v-model:content="emailContent"
 *   :serverRender="{ type: 'contact', templateId: 'welcome' }"
 *   :contact="currentUser"
 * />
 * ```
 *
 * @example With custom merge fields
 * ```vue
 * <EmailEditor
 *   v-model:subject="emailSubject"
 *   v-model:content="emailContent"
 *   :serverRender="{ type: 'contact', templateId: 'callout-response-answers' }"
 *   :mergeFields="{ MESSAGE: customMessage, CALLOUTTITLE: calloutTitle }"
 *   :contact="currentUser"
 * />
 * ```
 */
import { debounce } from '@beabee/beabee-common';
import {
  AppInput,
  AppLabel,
  AppRichTextEditor,
  AppSubHeading,
  type MergeTagGroup,
} from '@beabee/vue';

import type {
  EmailPreviewResult,
  EmailServerRenderConfig,
} from '@type/email-editor';
import { client } from '@utils/api';
import { ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

// Two-way binding models for subject and content
const subject = defineModel<string>('subject', { default: '' });
const content = defineModel<string>('content', { default: '' });

// Props definition
const props = withDefaults(
  defineProps<{
    /**
     * Optional heading text for the editor
     */
    heading?: string;

    /**
     * Server-side rendering configuration (required)
     * Configures the email template type and ID for preview generation
     */
    serverRender: EmailServerRenderConfig;

    /**
     * Custom merge fields to send to the server for preview
     * These override template-specific fields
     * Format: { FIELD_NAME: 'value' }
     */
    mergeFields?: Record<string, string>;

    /**
     * Merge field groups for the rich text editor dropdown
     * Enables insertion of merge fields via dropdown button in the editor
     */
    mergeFieldGroups?: MergeTagGroup[];

    /**
     * Label for subject input field
     * If not provided, uses default i18n key
     */
    subjectLabel?: string;

    /**
     * Label for content editor field
     * If not provided, uses default i18n key
     */
    contentLabel?: string;

    /**
     * Whether to always stack the preview below the editor (ignores responsive breakpoints)
     */
    alwaysStacked?: boolean;
  }>(),
  {
    heading: '',
    mergeFields: () => ({}),
    mergeFieldGroups: undefined,
    subjectLabel: '',
    contentLabel: '',
    alwaysStacked: false,
  }
);

const { t } = useI18n();

// Server preview state
const serverPreviewResult = ref<EmailPreviewResult | null>(null);
const isLoadingPreview = ref(false);

/**
 * Fetches preview from server using the API
 * Sends subject, content, and merge fields to the server
 * Server handles all merge field resolution and formatting
 */
async function fetchServerPreview() {
  isLoadingPreview.value = true;

  try {
    const preview = await client.email.preview(
      props.serverRender.type as 'contact' | 'general' | 'admin',
      props.serverRender.templateId || props.serverRender.type,
      {
        mergeFields: {
          MESSAGE: content.value,
          ...props.mergeFields,
        },
        customSubject: subject.value,
      }
    );

    serverPreviewResult.value = {
      subject: preview.subject,
      body: preview.body,
    };
  } catch {
    // Failed to load preview, component will show error state
    serverPreviewResult.value = null;
  } finally {
    isLoadingPreview.value = false;
  }
}

// Debounced version of fetchServerPreview to prevent excessive API calls
// Wait 500ms after user stops typing before fetching preview
const debouncedFetchServerPreview = debounce(fetchServerPreview, 500);

// Watch for content changes and fetch preview
// watchEffect automatically tracks reactive dependencies (subject, content, mergeFields)
watchEffect(() => {
  // Trigger re-fetch when any reactive value changes
  // Access these values to establish reactive dependencies
  void subject.value;
  void content.value;
  void props.mergeFields;

  void debouncedFetchServerPreview();
});
</script>
