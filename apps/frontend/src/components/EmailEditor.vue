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
            :label="t('emailEditor.subject.label')"
            required
          />
        </div>
        <AppRichTextEditor
          v-model="content"
          :label="t('emailEditor.body.label')"
          required
        >
          <template #toolbar="{ editor, disabled }">
            <div v-if="mergeFieldGroups" class="relative">
              <AppRichTextEditorButton
                :icon="faTag"
                :title="t('form.richtext.mergeFields')"
                :active="showMergeFieldsDropdown"
                :disabled="disabled"
                @click="toggleMergeFieldsDropdown"
              />
              <!-- Dropdown content -->
              <div
                v-if="showMergeFieldsDropdown"
                class="absolute right-0 top-full z-[100] mt-1 max-h-96 w-80 overflow-y-auto shadow-xl"
                @click.stop
              >
                <AppMergeFields
                  :groups="mergeFieldGroups"
                  @insert="(tag) => insertMergeField(editor, tag)"
                />
              </div>
            </div>
          </template>
        </AppRichTextEditor>
      </div>

      <!-- Preview panel -->
      <div class="w-full" :class="alwaysStacked ? '' : 'md:w-[600px]'">
        <ContactSelector
          v-if="previewSelectorOptions.length > 0"
          :model-value="previewContactIdValue"
          :options="previewSelectorOptions"
          :label="t('contacts.sendEmail.previewAsContact')"
          :self-option-label="t('contactSelector.selfOption')"
          :count-template="t('contactSelector.contactNOfTotal')"
          :previous-aria-label="t('actions.previous')"
          :next-aria-label="t('actions.next')"
          class="mb-3"
          @update:model-value="emitPreviewContactId"
        />
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
          <div v-else v-html="sanitizedPreviewBody" />
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
 * Merge fields are automatically loaded based on the template and context:
 * - Standard fields (SUPPORTEMAIL, ORGNAME) are always available
 * - Contact fields (EMAIL, NAME, FNAME, LNAME) for contact templates or when sending to contacts (e.g. previewContactOptions)
 * - Template-specific fields are loaded from the API
 *
 * @example Basic usage for contact email template
 * ```vue
 * <EmailEditor
 *   v-model:subject="emailSubject"
 *   v-model:content="emailContent"
 *   :template="{ type: 'contact', id: 'welcome' }"
 * />
 * ```
 *
 * @example With custom merge fields for preview
 * ```vue
 * <EmailEditor
 *   v-model:subject="emailSubject"
 *   v-model:content="emailContent"
 *   :template="{ type: 'contact', id: 'callout-response-answers' }"
 *   :mergeFields="{ CALLOUTTITLE: calloutTitle }"
 * />
 * ```
 */
import type { GetEmailTemplateInfoData } from '@beabee/beabee-common';
import { debounce } from '@beabee/beabee-common';
import type { PreviewEmailOptions } from '@beabee/client';
import {
  AppInput,
  AppLabel,
  AppMergeFields,
  AppRichTextEditor,
  AppRichTextEditorButton,
  AppSubHeading,
  type MergeTagGroup,
  sanitizeHtml,
} from '@beabee/vue';
import { ContactSelector } from '@beabee/vue';

import { faTag } from '@fortawesome/free-solid-svg-icons';
import { currentUser, generalContent } from '@store';
import type { Editor } from '@tiptap/vue-3';
import type {
  EmailPreviewResult,
  EmailTemplateConfig,
} from '@type/email-editor';
import { client } from '@utils/api';
import { computed, onMounted, ref, watchEffect } from 'vue';
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
     * Email template configuration
     * Configures the email template type and ID for preview generation
     * Also determines which merge fields are available
     */
    template?: EmailTemplateConfig;

    /**
     * Custom merge fields to send to the server for preview
     * These override template-specific fields
     * Format: { FIELD_NAME: 'value' }
     */
    mergeFields?: Record<string, string>;

    /**
     * Whether to always stack the preview below the editor (ignores responsive breakpoints)
     */
    alwaysStacked?: boolean;

    /**
     * Optional contact ID to use for preview. If not set, the current user is used.
     * Bind with v-model:previewContactId when passing previewContactOptions (e.g. segment send).
     */
    previewContactId?: string | null;

    /**
     * When provided, shows additional contacts in the selector (self + these).
     * Pass segment contacts for "send email to segment"; omit for template edit (self only).
     */
    previewContactOptions?: PreviewContactOption[];
  }>(),
  {
    heading: '',
    template: undefined,
    mergeFields: () => ({}),
    alwaysStacked: false,
    previewContactId: undefined,
    previewContactOptions: undefined,
  }
);

const emit = defineEmits<{
  (e: 'update:previewContactId', value: string | undefined): void;
}>();

/** Minimal contact shape for preview selector (id + display fields). */
export interface PreviewContactOption {
  id: string;
  firstname?: string;
  lastname?: string;
  email?: string;
}

/** Contact used for preview: override prop or current user. Same rule for template and one-off preview. */
const effectivePreviewContactId = computed(
  () => props.previewContactId ?? currentUser.value?.id ?? null
);

/** Options for the contact preview selector: always at least self, plus any passed contacts. */
const previewSelectorOptions = computed(() => {
  if (props.previewContactOptions === undefined) return [{ id: '' }];
  return [{ id: '' }, ...props.previewContactOptions];
});

const previewContactIdValue = computed(() => props.previewContactId ?? '');

function emitPreviewContactId(value: string) {
  emit('update:previewContactId', value || undefined);
}

const { t } = useI18n();

// Template info loaded from API
const templateInfoList = ref<GetEmailTemplateInfoData[]>([]);

// Merge fields dropdown state
const showMergeFieldsDropdown = ref(false);

// Server preview state
const serverPreviewResult = ref<EmailPreviewResult | null>(null);
const isLoadingPreview = ref(false);

/**
 * Build merge field groups based on template configuration
 * Includes: template-specific fields, contact fields (if contact type), standard fields
 */
const mergeFieldGroups = computed<MergeTagGroup[]>(() => {
  const groups: MergeTagGroup[] = [];

  // Template-specific merge fields (from API)
  if (props.template?.id) {
    const templateInfo = templateInfoList.value.find(
      (t) => t.id === props.template?.id
    );
    if (templateInfo && templateInfo.mergeFields.length > 0) {
      groups.push({
        key: 'template',
        tags: templateInfo.mergeFields.map((field) => ({ tag: field })),
      });
    }
  }

  // Contact merge fields (contact templates or when sending to contacts, e.g. segment send)
  if (
    props.template?.type === 'contact' ||
    props.previewContactOptions !== undefined
  ) {
    const user = currentUser.value;
    const fullName = user
      ? `${user.firstname} ${user.lastname}`.trim()
      : undefined;

    groups.push({
      key: 'contact',
      tags: [
        { tag: 'EMAIL', example: user?.email },
        { tag: 'NAME', example: fullName },
        { tag: 'FNAME', example: user?.firstname },
        { tag: 'LNAME', example: user?.lastname },
      ],
    });
  }

  // Standard merge fields (available for all templates)
  groups.push({
    key: 'standard',
    tags: [
      { tag: 'SUPPORTEMAIL', example: generalContent.value.supportEmail },
      { tag: 'ORGNAME', example: generalContent.value.organisationName },
    ],
  });

  return groups;
});

// Load template info on mount
onMounted(async () => {
  try {
    templateInfoList.value = await client.email.template.list();
  } catch {
    // Failed to load template info, merge fields will be limited
  }
});

/**
 * Sanitized preview body HTML
 * Sanitizes server-rendered HTML to prevent XSS attacks while preserving
 * email-safe HTML elements (styles, links, images, etc.)
 */
const sanitizedPreviewBody = computed(() => {
  return sanitizeHtml(serverPreviewResult.value?.body);
});

/**
 * Fetches preview from server using the API
 * Sends subject, content, and merge fields to the server
 * Server handles all merge field resolution and formatting
 */
async function fetchServerPreview() {
  isLoadingPreview.value = true;
  try {
    const previewOptions: PreviewEmailOptions = {
      subject: subject.value,
      body: content.value,
      contactId: effectivePreviewContactId.value ?? undefined,
      ...(Object.keys(props.mergeFields).length > 0 && {
        mergeFields: props.mergeFields,
      }),
    };
    const preview = props.template
      ? await client.email.template.preview(
          props.template.type,
          props.template.id,
          previewOptions
        )
      : await client.email.preview(previewOptions);
    if (!preview) {
      serverPreviewResult.value = null;
      return;
    }
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

/**
 * Toggle merge fields dropdown
 */
function toggleMergeFieldsDropdown(): void {
  showMergeFieldsDropdown.value = !showMergeFieldsDropdown.value;
}

/**
 * Insert merge field tag into editor at cursor position
 */
function insertMergeField(editor: Editor, tag: string): void {
  const mergeTag = `*|${tag}|*`;
  editor.chain().focus().insertContent(mergeTag).run();
  showMergeFieldsDropdown.value = false;
}

// Debounced version of fetchServerPreview to prevent excessive API calls
// Wait 500ms after user stops typing before fetching preview
const debouncedFetchServerPreview = debounce(fetchServerPreview, 500);

// Watch for content changes and fetch preview
// watchEffect automatically tracks reactive dependencies (subject, content, mergeFields)
watchEffect(() => {
  // Trigger re-fetch when any reactive value changes
  void subject.value;
  void content.value;
  void props.mergeFields;
  void effectivePreviewContactId.value;

  void debouncedFetchServerPreview();
});
</script>
