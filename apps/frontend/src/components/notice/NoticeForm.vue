<template>
  <AppForm
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
  </AppForm>
</template>

<script lang="ts" setup>
import { format } from 'date-fns';
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';

import AppForm from '@components/forms/AppForm.vue';
import AppInput from '@components/forms/AppInput.vue';
import AppLabel from '@components/forms/AppLabel.vue';

import type { NoticeFormData } from './notice.interface';
import type { CreateNoticeData, GetNoticeData } from '@type';

defineEmits(['submit']);
const props = defineProps<{ notice: GetNoticeData | undefined }>();

const { t } = useI18n();

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
