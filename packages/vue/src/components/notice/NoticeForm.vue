<template>
  <AppForm
    :button-text="labels.save"
    @submit.prevent="$emit('submit', convertFormData(data))"
  >
    <div class="mb-3">
      <AppInput v-model="data.name" :label="labels.name" required />
    </div>

    <AppLabel :label="labels.startDateAndTime" />
    <div class="mb-3 flex">
      <div>
        <AppInput v-model="data.startDate" type="date" />
      </div>
      <div>
        <AppInput v-model="data.startTime" type="time" />
      </div>
    </div>

    <AppLabel :label="labels.expirationDateAndTime" />
    <div class="mb-3 flex">
      <div>
        <AppInput v-model="data.expirationDate" type="date" />
      </div>
      <div>
        <AppInput v-model="data.expirationTime" type="time" />
      </div>
    </div>

    <div class="mb-3">
      <AppInput v-model="data.text" :label="labels.text" required />
    </div>

    <div class="mb-3">
      <AppInput v-model="data.buttonText" :label="labels.buttonText" />
    </div>

    <div class="mb-3">
      <AppInput
        v-model="data.url"
        :required="!!data.buttonText"
        :label="labels.url"
      />
    </div>
  </AppForm>
</template>

<script lang="ts" setup>
import type { CreateNoticeData } from '@beabee/beabee-common';

import { format } from 'date-fns';
import { reactive } from 'vue';

import type {
  NoticeFormData,
  NoticeFormEmits,
  NoticeFormProps,
} from '../../types/notice';
import { AppForm, AppInput, AppLabel } from '../form';

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
