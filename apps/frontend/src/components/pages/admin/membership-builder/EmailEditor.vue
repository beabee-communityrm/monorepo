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
          <AppRichTextEditor v-model="email.body" :label="bodyLabel" required />
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

import { computed, ref } from 'vue';

import { currentUser } from '../../../../store';

const props = withDefaults(
  defineProps<{
    label?: string;
    // Should be GetEmailData | false but compiler doesn't correctly convert type to Vue props
    email: { body: string; subject: string } | false;
    footer?: string;
    subjectLabel?: string;
    bodyLabel?: string;
  }>(),
  {
    label: '',
    footer: '',
    subjectLabel: 'Subject',
    bodyLabel: 'Message',
  }
);

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
