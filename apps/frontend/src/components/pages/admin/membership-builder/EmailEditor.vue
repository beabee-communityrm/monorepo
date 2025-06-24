<template>
  <App2ColGrid class="mb-6">
    <template #col1>
      <AppSubHeading>{{ label }}</AppSubHeading>
      <template v-if="email">
        <div class="mb-4">
          <AppInput v-model="email.subject" label="Subject" required />
        </div>
        <AppRichTextEditor
          v-model="email.body"
          label="Message"
          :labels="editorLabels"
          copyable
          :copy-button-props="{
            copyButtonTitle: t('actions.copy'),
            successMessage: t('notifications.copy.success'),
            errorMessage: t('notifications.error'),
            removeAriaLabel: t('notifications.remove'),
          }"
          required
        />
      </template>
      <AppNotification v-else variant="warning" title="Can't edit email">
        <p>
          This email is managed by your email provider, you can't edit it here
        </p>
      </AppNotification>
    </template>
    <template v-if="email" #col2>
      <div class="content-message bg-white p-4 shadow" v-html="emailBody" />
    </template>
  </App2ColGrid>
</template>
<script lang="ts" setup>
import {
  App2ColGrid,
  AppInput,
  AppNotification,
  AppRichTextEditor,
  AppSubHeading,
} from '@beabee/vue';

import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useRichTextEditorLabels } from '../../../../composables/useRichTextEditorLabels';
import { currentUser } from '../../../../store';

const { t } = useI18n();
const editorLabels = useRichTextEditorLabels();

const props = defineProps<{
  label: string;
  // Should be GetEmailData | false but compiler doesn't correctly convert type to Vue props
  email: { body: string; subject: string } | false;
  footer: string;
}>();

// Allows us to mutate the props directly
const email = ref(props.email);

const emailBody = computed(
  () =>
    props.email &&
    props.email.body
      .replace('*|FNAME|*', currentUser.value?.firstname || '')
      .replace('*|LNAME|*', currentUser.value?.lastname || '') + props.footer
);
</script>
