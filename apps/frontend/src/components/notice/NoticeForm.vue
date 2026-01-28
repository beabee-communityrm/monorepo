<template>
  <AppApiForm
    :button-text="t('actions.save')"
    @submit.prevent="$emit('submit', convertFormData(data))"
  >
    <div class="mb-3">
      <AppInput
        v-model="data.name"
        :label="t('addNotice.form.name')"
        required
      />
    </div>

    <AppLabel :label="t('addNotice.form.startDateAndTime')" />
    <div class="mb-3 flex">
      <div>
        <AppInput v-model="data.startDate" type="date" />
      </div>
      <div>
        <AppInput v-model="data.startTime" type="time" />
      </div>
    </div>

    <AppLabel :label="t('addNotice.form.expirationDateAndTime')" />
    <div class="mb-3 flex">
      <div>
        <AppInput v-model="data.expirationDate" type="date" />
      </div>
      <div>
        <AppInput v-model="data.expirationTime" type="time" />
      </div>
    </div>

    <div class="mb-3">
      <AppInput
        v-model="data.text"
        :label="t('addNotice.form.text')"
        required
      />
    </div>

    <div class="mb-3">
      <AppInput
        v-model="data.buttonText"
        :label="t('addNotice.form.buttonText')"
      />
    </div>

    <div class="mb-3">
      <AppInput
        v-model="data.url"
        :required="!!data.buttonText"
        :label="t('addNotice.form.url')"
      />
    </div>
  </AppApiForm>
</template>

<script lang="ts" setup>
import type { CreateNoticeData } from '@beabee/beabee-common';
import type { GetNoticeData } from '@beabee/beabee-common';
import { AppInput, AppLabel } from '@beabee/vue';

import AppApiForm from '@components/forms/AppApiForm.vue';
import { format } from 'date-fns';
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';

/**
 * Form data structure for notice creation and editing
 */
interface NoticeFormData {
  /** The display name of the notice */
  name: string;
  /** Start date in YYYY-MM-DD format */
  startDate: string;
  /** Start time in HH:mm format */
  startTime: string;
  /** Expiration date in YYYY-MM-DD format */
  expirationDate: string;
  /** Expiration time in HH:mm format */
  expirationTime: string;
  /** The main text content of the notice */
  text: string;
  /** Optional button text for call-to-action */
  buttonText?: string;
  /** Optional URL for the button action */
  url?: string;
}

/**
 * Props for the NoticeForm component
 */
interface NoticeFormProps {
  /** Optional notice data for editing existing notices */
  notice?: GetNoticeData;
}

/**
 * Events emitted by the NoticeForm component
 */
interface NoticeFormEmits {
  /** Emitted when form is submitted with notice data */
  submit: [data: CreateNoticeData];
}

const { t } = useI18n();

defineEmits<NoticeFormEmits>();
const props = withDefaults(defineProps<NoticeFormProps>(), {
  notice: undefined,
});

const data = props.notice
  ? reactive<NoticeFormData>({
      name: props.notice.name,
      startDate: props.notice.starts
        ? format(props.notice.starts, 'yyyy-MM-dd')
        : '',
      startTime: props.notice.starts
        ? format(props.notice.starts, 'HH:mm')
        : '',
      expirationDate: props.notice.expires
        ? format(props.notice.expires, 'yyyy-MM-dd')
        : '',
      expirationTime: props.notice.expires
        ? format(props.notice.expires, 'HH:mm')
        : '',
      text: props.notice.text,
      buttonText: props.notice.buttonText || '',
      url: props.notice.url || '',
    })
  : reactive<NoticeFormData>({
      name: '',
      startDate: '',
      startTime: '',
      expirationDate: '',
      expirationTime: '',
      text: '',
      buttonText: '',
      url: '',
    });

/**
 * Converts form data to API-compatible format
 * @param notice - The form data to convert
 * @returns Converted notice data ready for API submission
 */
function convertFormData(notice: NoticeFormData): CreateNoticeData {
  return {
    name: notice.name,
    starts: new Date(notice.startDate + 'T' + notice.startTime),
    expires: new Date(notice.expirationDate + 'T' + notice.expirationTime),
    text: notice.text,
    buttonText: notice.buttonText,
    url: notice.url,
  };
}
</script>
