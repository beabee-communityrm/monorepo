<template>
  <div class="flex max-h-full min-h-0 flex-1">
    <div class="relative flex-1 bg-white p-6 shadow-md">
      <div class="mx-auto max-h-full max-w-3xl overflow-y-auto">
        <!-- Info box when contact settings are not enabled -->
        <AppNotification
          v-if="!collectInfoEnabled"
          variant="warning"
          :title="t('callout.builder.tabs.email.collectInfoWarning.title')"
          class="mb-6"
        >
          <p>
            {{ t('callout.builder.tabs.email.collectInfoWarning.description') }}
          </p>
        </AppNotification>

        <!-- Toggle to enable/disable email -->
        <AppFormField class="mb-6">
          <AppToggleField
            v-model="data.sendEmail"
            variant="link"
            :label="t('callout.builder.tabs.email.sendEmail.label')"
            :description="t('callout.builder.tabs.email.sendEmail.description')"
            :disabled="!collectInfoEnabled"
          />
        </AppFormField>

        <!-- Email editor with server-side preview (merge fields resolved server-side) -->
        <div class="relative overflow-visible">
          <EmailEditor
            v-model:subject="emailData.subject"
            v-model:content="emailData.content"
            :merge-fields="{
              CALLOUTTITLE: props.tabs.titleAndImage.data.title.default,
              CALLOUTLINK: generateCalloutLink(
                props.tabs.titleAndImage.data.slug,
                true
              ),
            }"
            :merge-field-groups="mergeFieldGroups"
            :server-render="{
              type: 'contact',
              templateId: 'callout-response-answers',
            }"
            :subject-label="t('callout.builder.tabs.email.subject.label')"
            :content-label="t('callout.builder.tabs.email.body.label')"
            :always-stacked="true"
          />
        </div>
      </div>
    </div>

    <!-- Right Sidebar -->
    <div class="flex-0 basis-[15rem] overflow-y-auto">
      <!-- Empty right sidebar -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  AppFormField,
  AppNotification,
  AppToggleField,
  type MergeTagGroup,
} from '@beabee/vue';

import EmailEditor from '@components/pages/admin/membership-builder/EmailEditor.vue';
import { currentUser } from '@store/currentUser';
import type { LocaleProp } from '@type';
import { generateCalloutLink } from '@utils/callouts';
import { computed, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { SidebarTabProps } from '../SidebarTabs.interface';

/**
 * Data for the email tab in the sidebar
 */
export interface EmailTabData {
  /** Whether to send an email to participants after submission */
  sendEmail: boolean;
  /** Email subject line */
  emailSubject: LocaleProp;
  /** Email message content (used as MESSAGE merge field value) */
  emailMessage: LocaleProp;
}

/**
 * Props for the EmailTab component
 */
export type EmailTabProps = SidebarTabProps<EmailTabData>;

const props = defineProps<EmailTabProps>();
const { t } = useI18n();

// Check if "Collect contact information" is enabled in the settings tab
const collectInfoEnabled = computed(() => props.tabs.settings.data.collectInfo);

// Merge field groups for the rich text editor dropdown
const mergeFieldGroups = computed<MergeTagGroup[]>(() => {
  const user = currentUser.value;
  const fullName = user
    ? `${user.firstname} ${user.lastname}`.trim()
    : undefined;

  return [
    {
      key: 'contact',
      tags: [
        { tag: 'EMAIL', example: user?.email },
        { tag: 'NAME', example: fullName },
        { tag: 'FNAME', example: user?.firstname },
        { tag: 'LNAME', example: user?.lastname },
      ],
    },
    {
      key: 'magic',
      tags: [{ tag: 'RPLINK' }, { tag: 'LOGINLINK' }, { tag: 'SPLINK' }],
    },
    {
      key: 'template',
      tags: [
        {
          tag: 'CALLOUTTITLE',
          example: props.tabs.titleAndImage.data.title.default,
        },
        {
          tag: 'CALLOUTLINK',
          example: generateCalloutLink(
            props.tabs.titleAndImage.data.slug,
            true
          ),
        },
        { tag: 'CALLOUTSLUG', example: props.tabs.titleAndImage.data.slug },
        { tag: 'SUPPORTEMAIL' },
      ],
    },
  ];
});

// Available merge tags for default email template translations
// This is necessary because `vue-i18n` otherwise tries to interpret the syntax `*|MERGE_TAG|*` itself.
const mergeTagPlaceholders = computed(() => ({
  // Contact fields (available in all contact emails)
  EMAIL: '*|EMAIL|*',
  NAME: '*|NAME|*',
  FNAME: '*|FNAME|*',
  LNAME: '*|LNAME|*',
  // Magic merge fields (automatically generated)
  RPLINK: '*|RPLINK|*',
  LOGINLINK: '*|LOGINLINK|*',
  SPLINK: '*|SPLINK|*',
  // Template-specific fields
  MESSAGE: '*|MESSAGE|*',
  CALLOUTTITLE: '*|CALLOUTTITLE|*',
  CALLOUTLINK: '*|CALLOUTLINK|*',
  SUPPORTEMAIL: '*|SUPPORTEMAIL|*',
}));

// Create reactive email data that syncs with props.data
const emailData = reactive({
  subject:
    props.data.emailSubject.default ||
    t('callout.builder.tabs.email.subject.default', mergeTagPlaceholders.value),
  content:
    props.data.emailMessage.default ||
    t('callout.builder.tabs.email.body.default', mergeTagPlaceholders.value),
});

/**
 * Bi-directional sync between local emailData and parent's reactive props.data
 *
 * Props mutation is intentionally used here because:
 * - Component is rendered dynamically via <component :is> with v-bind
 * - Parent passes reactive objects and expects these mutations
 * - Alternative solutions (defineModel, emit) don't work with dynamic components
 */
watch(
  emailData,
  (newValue) => {
    // eslint-disable-next-line vue/no-mutating-props
    props.data.emailSubject.default = newValue.subject;
    // eslint-disable-next-line vue/no-mutating-props
    props.data.emailMessage.default = newValue.content;
  },
  { deep: true }
);

// Watch props.data changes and sync to emailData
watch(
  () => [props.data.emailSubject.default, props.data.emailMessage.default],
  ([subject, message]) => {
    // Use default translations if values are empty
    const defaultSubject =
      subject || t('callout.builder.tabs.email.subject.default');
    const defaultMessage =
      message ||
      t('callout.builder.tabs.email.body.default', mergeTagPlaceholders.value);

    emailData.subject = defaultSubject;
    emailData.content = defaultMessage;

    // Update props with default values if they were empty
    if (!subject) {
      // eslint-disable-next-line vue/no-mutating-props
      props.data.emailSubject.default = defaultSubject;
    }
    if (!message) {
      // eslint-disable-next-line vue/no-mutating-props
      props.data.emailMessage.default = defaultMessage;
    }
  },
  { immediate: true }
);
</script>
