<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="flex max-h-full min-h-0 flex-1">
    <div class="flex-1 overflow-y-auto bg-white p-6 shadow-md">
      <AppFormBox class="mx-auto max-w-3xl">
        <AppRadioGroup
          v-model="data.whenFinished"
          name="whenFinished"
          :label="inputT('action.label')"
          :options="[
            ['message', inputT('action.opts.showMessage')],
            ['redirect', inputT('action.opts.redirect')],
          ]"
          required
        />
      </AppFormBox>
      <template v-if="data.whenFinished === 'message'">
        <AppFormBox class="mx-auto max-w-3xl" :help="inputT('title.help')">
          <LocaleInput
            v-model="data.thankYouTitle"
            :locales="locales"
            :label="inputT('title.label')"
            :placeholder="inputT('title.placeholder')"
            required
          />
        </AppFormBox>

        <AppFormBox class="mx-auto max-w-3xl" :help="inputT('text.help')">
          <LocaleRichTextEditor
            v-model="data.thankYouText"
            :locales="locales"
            :label="inputT('text.label')"
            :placeholder="inputT('text.placeholder')"
            required
          />
        </AppFormBox>
      </template>
      <AppFormBox v-else class="mx-auto max-w-3xl" :help="inputT('url.help')">
        <LocaleInput
          v-model="data.thankYouRedirect"
          :locales="locales"
          :label="inputT('url.label')"
          :placeholder="inputT('url.placeholder')"
          type="url"
          required
        />
      </AppFormBox>
    </div>
    <!-- Right Sidebar -->
    <div class="flex-0 basis-[15rem] overflow-y-auto">
      <p>Right Sidebar</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import useVuelidate from '@vuelidate/core';
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';
import AppRadioGroup from '../../../../../../forms/AppRadioGroup.vue';
import AppFormBox from '../../../../../../forms/AppFormBox.vue';
import LocaleRichTextEditor from '@components/forms/LocaleRichTextEditor.vue';
import LocaleInput from '@components/forms/LocaleInput.vue';
import type { LocaleProp } from '@type';
import type { SidebarTabProps } from '../SidebarTabs.interface';

/**
 * Data for the end message tab in the sidebar
 */
export interface EndMessageTabData {
  /** Whether to show a message or redirect after form submission */
  whenFinished: 'message' | 'redirect';
  /** Title for the thank you message */
  thankYouTitle: LocaleProp;
  /** Content for the thank you message */
  thankYouText: LocaleProp;
  /** Redirect URL after form submission */
  thankYouRedirect: LocaleProp;
}

export type EndMessageTabProps = SidebarTabProps<EndMessageTabData>;

const emit = defineEmits(['update:error', 'update:validated']);
defineProps<EndMessageTabProps>();

const { t } = useI18n();
const inputT = (key: string) =>
  t('createCallout.tabs.endMessage.inputs.' + key);

const validation = useVuelidate();

watch(
  validation,
  () => {
    emit('update:error', validation.value.$errors.length > 0);
    emit('update:validated', !validation.value.$invalid);
  },
  { immediate: true }
);
</script>
