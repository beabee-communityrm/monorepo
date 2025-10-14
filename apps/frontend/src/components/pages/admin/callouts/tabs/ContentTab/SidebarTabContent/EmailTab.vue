<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="flex max-h-full min-h-0 flex-1">
    <div class="flex-1 overflow-y-auto bg-white p-6 shadow-md">
      <div class="mx-auto max-w-3xl">
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

        <EmailEditor :email="emailData" footer="" />
      </div>
    </div>

    <!-- Right Sidebar -->
    <div class="flex-0 basis-[15rem] overflow-y-auto">
      <!-- Empty right sidebar -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AppFormField, AppNotification, AppToggleField } from '@beabee/vue';

import EmailEditor from '@components/pages/admin/membership-builder/EmailEditor.vue';
import type { LocaleProp } from '@type';
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
  /** Email body content */
  emailBody: LocaleProp;
}

/**
 * Props for the EmailTab component
 */
export type EmailTabProps = SidebarTabProps<EmailTabData>;

const props = defineProps<EmailTabProps>();
const { t } = useI18n();

// Check if "Collect contact information" is enabled in the settings tab
const collectInfoEnabled = computed(() => props.tabs.settings.data.collectInfo);

// Create reactive email data that syncs with props.data
const emailData = reactive({
  subject: props.data.emailSubject.default,
  body: props.data.emailBody.default,
});

// Watch emailData changes and sync to props.data
watch(
  emailData,
  (newValue) => {
    // eslint-disable-next-line vue/no-mutating-props
    props.data.emailSubject.default = newValue.subject;
    // eslint-disable-next-line vue/no-mutating-props
    props.data.emailBody.default = newValue.body;
  },
  { deep: true }
);

// Watch props.data changes and sync to emailData
watch(
  () => [props.data.emailSubject.default, props.data.emailBody.default],
  ([subject, body]) => {
    emailData.subject = subject;
    emailData.body = body;
  }
);
</script>
