<template>
  <div>
    <AppSubHeading v-if="heading">{{ heading }}</AppSubHeading>
    <template v-if="template">
      <div
        class="relative mb-6 flex flex-col gap-6"
        :class="alwaysStacked ? '' : 'md:flex-row'"
      >
        <!-- Editor panel -->
        <div class="relative min-w-0 flex-1">
          <div class="mb-4">
            <AppInput
              v-model="template.subject"
              :label="subjectLabel || t('emailEditor.subject.label')"
              required
            />
          </div>
          <AppRichTextEditor
            v-model="template.content"
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
            <!-- Server preview loading state -->
            <div
              v-if="isServerPreview && isLoadingPreview"
              class="text-gray-500 flex items-center justify-center p-8"
            >
              <div
                class="border-gray-900 mr-2 h-6 w-6 animate-spin rounded-full border-b-2"
              ></div>
              {{ t('common.loading') }}
            </div>

            <!-- Server preview error state -->
            <div
              v-else-if="isServerPreview && !serverPreviewResult"
              class="text-gray-500 flex items-center justify-center p-8"
            >
              {{ t('emailEditor.preview.unavailable') }}
            </div>

            <!-- Preview content -->
            <div v-else v-html="previewContent" />
          </div>
        </div>
      </div>
    </template>

    <!-- Warning for managed emails -->
    <AppNotification
      v-else
      variant="warning"
      :title="t('emailEditor.managed.title')"
    >
      <p>{{ t('emailEditor.managed.description') }}</p>
    </AppNotification>
  </div>
</template>
<script lang="ts" setup>
/**
 * EmailEditor component for editing and previewing email templates
 *
 * This component supports three preview modes with priority order:
 *
 * 1. Server-side rendering (highest priority):
 *    - Renders email preview through API with server-side merge field resolution
 *    - Requires the `serverRender` prop to configure API endpoints
 *    - All merge fields (mergeFields + contact) are sent to server
 *    - Perfect for complex email templates requiring server-side processing
 *
 * 2. Client-side merge field expansion:
 *    - Supports merge tags like *|FNAME|*, *|EMAIL|* in content
 *    - Uses `mergeFields` prop for custom field values
 *    - Uses `contact` prop for contact-specific tags
 *    - Updates preview instantly without server calls
 *
 * 3. Direct content editing (lowest priority):
 *    - Displays content directly with no transformations
 *    - Used when no merge fields or server rendering is configured
 *
 * @example Server-side rendering
 * ```vue
 * <EmailEditor
 *   :template="{ subject: 'Welcome', content: 'Hello *|FNAME|*' }"
 *   :serverRender="{ type: 'contact', templateId: 'welcome' }"
 *   :mergeFields="{ CUSTOM_FIELD: 'Custom Value' }"
 *   :contact="currentUser"
 * />
 * ```
 *
 * @example Client-side merge field expansion
 * ```vue
 * <EmailEditor
 *   :template="{ subject: 'Newsletter', content: 'Hello *|FNAME|*' }"
 *   :mergeFields="{ CONTENT: 'Newsletter content' }"
 *   :contact="currentUser"
 * />
 * ```
 *
 * @example Direct content editing
 * ```vue
 * <EmailEditor
 *   :template="{ subject: 'Simple Email', content: '<p>Static content</p>' }"
 * />
 * ```
 */
import {
  debounce,
  expandNestedMergeFields,
  replaceMergeFields,
} from '@beabee/beabee-common';
import type { GetContactData } from '@beabee/beabee-common';
import {
  AppInput,
  AppLabel,
  AppNotification,
  AppRichTextEditor,
  AppSubHeading,
  type MergeTagGroup,
} from '@beabee/vue';

import type {
  EditableEmailTemplate,
  EmailPreviewResult,
  EmailServerRenderConfig,
} from '@type/email-editor';
import { client } from '@utils/api';
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

// Props definition with clearer naming and organization
const props = withDefaults(
  defineProps<{
    /**
     * Email template data to edit
     * - content: The editable content (body or merge field value)
     * - subject: The email subject line
     * Set to false when email is managed externally and can't be edited
     */
    template: EditableEmailTemplate | false;

    /**
     * Optional heading text for the editor
     */
    heading?: string;

    /**
     * Optional HTML footer to append to the preview
     */
    footer?: string;

    /**
     * Server-side rendering configuration
     * When provided, enables server-side preview with merge field resolution
     */
    serverRender?: EmailServerRenderConfig;

    /**
     * Merge fields for both client-side and server-side preview
     * Format: { FIELD_NAME: 'value' }
     */
    mergeFields?: Record<string, string>;

    /**
     * Contact data for generating contact-specific merge tags
     * Enables preview of contact merge tags like *|FNAME|*, *|LNAME|*, *|EMAIL|*
     */
    contact?: GetContactData | null;

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
    footer: '',
    mergeFields: () => ({}),
    contact: null,
    serverRender: undefined,
    mergeFieldGroups: undefined,
    subjectLabel: '',
    contentLabel: '',
    alwaysStacked: false,
  }
);

const { t } = useI18n();

// Use reactive reference to the template for two-way binding
const template = reactive<EditableEmailTemplate>(
  props.template || { subject: '', content: '' }
);

// Watch for template prop changes to sync with parent component
watch(
  () => props.template,
  (newTemplate) => {
    if (newTemplate) {
      template.subject = newTemplate.subject;
      template.content = newTemplate.content;
    }
  },
  { deep: true, immediate: true }
);

// Computed flag to determine if using server-side preview
const isServerPreview = computed(() => !!props.serverRender);

// Server preview state
const serverPreviewResult = ref<EmailPreviewResult | null>(null);
const isLoadingPreview = ref(false);

/**
 * Fetches preview from server using the API
 */
async function fetchServerPreview() {
  if (!props.serverRender || !template) return;

  const allMergeFields = generateAllMergeFields();
  isLoadingPreview.value = true;

  try {
    const preview = await client.email.preview(
      props.serverRender.type as 'contact' | 'general' | 'admin',
      props.serverRender.templateId || props.serverRender.type,
      {
        mergeFields: {
          MESSAGE: template.content,
          ...allMergeFields,
        },
        customSubject: template.subject,
      }
    );

    serverPreviewResult.value = {
      subject: preview.subject,
      body: preview.body,
    };
  } catch {
    // Failed to load preview, component will show fallback content
    serverPreviewResult.value = null;
  } finally {
    isLoadingPreview.value = false;
  }
}

// Debounced version of fetchServerPreview to prevent excessive API calls
// Wait 500ms after user stops typing before fetching preview
const debouncedFetchServerPreview = debounce(fetchServerPreview, 500);

// Watch for server render config changes
watch(
  () => props.serverRender,
  (newConfig) => {
    if (newConfig) {
      debouncedFetchServerPreview();
    } else {
      serverPreviewResult.value = null;
    }
  },
  { immediate: true }
);

// Watch for content changes to update server preview
watch(
  [
    () => template.subject,
    () => template.content,
    () => props.mergeFields,
    () => props.contact,
  ],
  () => {
    if (props.serverRender) {
      debouncedFetchServerPreview();
    }
  },
  { deep: true }
);

/**
 * Generates contact-specific merge tags
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
    NAME: `${contact.firstname} ${contact.lastname}`.trim(),

    // Contact ID
    ...(contact.id && { MEMBERSHIPID: contact.id }),
  };
}

/**
 * Generates merge fields from merge field groups (for client-side preview)
 */
function generateMergeFieldsFromGroups(): Record<string, string> {
  if (!props.mergeFieldGroups) return {};

  const mergeFields: Record<string, string> = {};

  for (const group of props.mergeFieldGroups) {
    for (const tag of group.tags) {
      // Only include example values for preview
      if (tag.example !== undefined) {
        mergeFields[tag.tag] = tag.example;
      }
    }
  }

  return mergeFields;
}

/**
 * Combines all merge fields from different sources
 */
function generateAllMergeFields(): Record<string, string> {
  const customMergeFields = { ...props.mergeFields };
  const contactMergeFields = generateContactMergeTags(props.contact);
  const groupMergeFields = generateMergeFieldsFromGroups();

  // Priority: customMergeFields > contactMergeFields > groupMergeFields
  return { ...groupMergeFields, ...contactMergeFields, ...customMergeFields };
}

/**
 * Computes the final preview content based on mode priority:
 * 1. Server-rendered preview (highest priority)
 * 2. Client-side merge field expansion
 * 3. Direct content (lowest priority)
 */
const previewContent = computed(() => {
  if (!props.template) return '';

  // Priority 1: Server-rendered preview
  if (isServerPreview.value && serverPreviewResult.value) {
    return serverPreviewResult.value.body + (props.footer || '');
  }

  // Priority 2: Client-side merge field expansion
  const allMergeFields = generateAllMergeFields();
  if (Object.keys(allMergeFields).length > 0) {
    const expandedFields = expandNestedMergeFields(allMergeFields);
    const expandedContent = replaceMergeFields(
      template.content,
      expandedFields
    );
    return expandedContent + (props.footer || '');
  }

  // Priority 3: Direct content
  return template.content + (props.footer || '');
});
</script>
