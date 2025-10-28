<!-- eslint-disable vue/no-mutating-props -->
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
        <!-- Note: The editor needs overflow-visible for the merge fields dropdown -->
        <div class="relative overflow-visible">
          <EmailEditor
            :template="emailData"
            :merge-fields="{
              CALLOUTTITLE: props.tabs.titleAndImage.data.title.default,
              CALLOUTLINK: generateCalloutLink(
                props.tabs.titleAndImage.data.slug,
                true
              ),
              CALLOUTSLUG: props.tabs.titleAndImage.data.slug,
            }"
            :merge-field-groups="mergeFieldGroups"
            :server-render="{
              type: 'contact',
              templateId: 'callout-response-answers',
            }"
            :footer="emailFooter"
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
import { client } from '@utils/api';
import { generateCalloutLink } from '@utils/callouts';
import { computed, onBeforeMount, reactive, ref, watch } from 'vue';
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

// Email footer for preview
const emailFooter = ref('');

// Available merge tags for callout-response-answers template (for i18n)
const defaultMergeTags = computed(() => ({
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
  ANSWERS: '*|ANSWERS|*',
}));

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
      key: 'template',
      tags: [
        { tag: 'MESSAGE' },
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
        { tag: 'SUPPORTEMAIL' },
        { tag: 'ANSWERS' },
      ],
    },
    {
      key: 'magic',
      tags: [
        { tag: 'LOGINLINK', example: window.location.origin + '/auth/login' },
      ],
    },
  ];
});

// Create reactive email data that syncs with props.data
// Note: 'content' here represents the MESSAGE merge field value,
// not the complete rendered email body
const emailData = reactive({
  subject:
    props.data.emailSubject.default ||
    t('callout.builder.tabs.email.subject.default'),
  content:
    props.data.emailMessage.default ||
    t('callout.builder.tabs.email.body.default', defaultMergeTags.value),
});

// Watch emailData changes and sync to props.data
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
      t('callout.builder.tabs.email.body.default', defaultMergeTags.value);

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

// Load email footer on component mount
onBeforeMount(async () => {
  emailFooter.value = (await client.content.get('email')).footer;
});
</script>
