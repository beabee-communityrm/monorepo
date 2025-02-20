<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div>
    <AppFormSection>
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
    </AppFormSection>
    <template v-if="data.whenFinished === 'message'">
      <AppFormSection :help="inputT('title.help')">
        <LocaleInput
          v-model="data.thankYouTitle"
          :locales="tabs.settings.data.locales"
          :label="inputT('title.label')"
          :placeholder="inputT('title.placeholder')"
          required
        />
      </AppFormSection>

      <AppFormSection :help="inputT('text.help')">
        <LocaleRichTextEditor
          v-model="data.thankYouText"
          :locales="tabs.settings.data.locales"
          :label="inputT('text.label')"
          :placeholder="inputT('text.placeholder')"
          required
        />
      </AppFormSection>
    </template>
    <AppFormSection v-else :help="inputT('url.help')">
      <LocaleInput
        v-model="data.thankYouRedirect"
        :locales="tabs.settings.data.locales"
        :label="inputT('url.label')"
        :placeholder="inputT('url.placeholder')"
        type="url"
        required
      />
    </AppFormSection>
  </div>
</template>

<script lang="ts" setup>
import useVuelidate from '@vuelidate/core';
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';
import AppRadioGroup from '../../../../../../forms/AppRadioGroup.vue';
import type { CalloutHorizontalTabs } from '@components/pages/admin/callouts/CalloutHorizontalTabs.vue';
import AppFormSection from '../../../../../../forms/AppFormSection.vue';
import LocaleRichTextEditor from '@components/forms/LocaleRichTextEditor.vue';
import LocaleInput from '@components/forms/LocaleInput.vue';
import type { LocaleProp } from '@type';
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

export interface EndMessageTabProps {
  data: EndMessageTabData;
  tabs: CalloutHorizontalTabs;
}

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
