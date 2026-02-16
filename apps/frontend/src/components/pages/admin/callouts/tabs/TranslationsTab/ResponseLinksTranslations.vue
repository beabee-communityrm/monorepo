<template>
  <AppFormBox
    v-if="responseLinks.length > 0"
    :title="t('callout.builder.tabs.translations.responseLinks.title')"
  >
    <div
      v-for="(link, i) in responseLinks"
      :key="link.url + ':' + i"
      class="mb-6 space-y-2"
    >
      <label class="block text-sm font-medium">
        {{ t('callout.builder.tabs.settings.inputs.responseLinks.text.label') }}
      </label>

      <AppInput
        :model-value="getValue(link.text, selectedLocale)"
        :placeholder="getPlaceholder(link.text)"
        :disabled="selectedLocale === defaultLocale"
        :copyable="selectedLocale === defaultLocale"
        @update:model-value="updateValue(link.text, selectedLocale, $event)"
      />
    </div>
  </AppFormBox>
</template>

<script lang="ts" setup>
import { AppFormBox, AppInput } from '@beabee/vue';

import { useI18n } from 'vue-i18n';

import type { LocaleProp } from '#type/locale-prop';
import { getComponentText, updateComponentText } from '#utils/callouts';

const props = defineProps<{
  responseLinks: { text: string; url: string }[];
  defaultLocale: string;
  selectedLocale: string;
  /**
   * Map of response link label refs to LocaleProp values within the translations tab.
   * Named to align with variant field `responseLinkText` for clarity.
   */
  responseLinkText: Record<string, LocaleProp>;
}>();

const { t } = useI18n();

function getValue(ref: string, locale: string): string {
  return getComponentText(
    props.responseLinkText,
    ref,
    locale,
    props.defaultLocale,
    false // useFallback: false
  );
}

function getPlaceholder(ref: string): string {
  return getComponentText(
    props.responseLinkText,
    ref,
    props.selectedLocale,
    props.defaultLocale
  );
}

function updateValue(ref: string, locale: string, value: string): void {
  updateComponentText(
    props.responseLinkText,
    ref,
    locale,
    value,
    props.defaultLocale
  );
}
</script>
