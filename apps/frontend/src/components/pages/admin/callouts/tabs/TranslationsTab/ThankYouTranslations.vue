<template>
  <AppFormBox :title="t('callout.builder.tabs.endMessage.title')">
    <div v-if="endMessage.whenFinished === 'message'" class="space-y-6">
      <!-- Thank You Title -->
      <div class="space-y-2">
        <label class="block text-sm font-medium">
          {{ t('callout.builder.tabs.endMessage.inputs.title.label') }}
        </label>

        <AppInput
          :model-value="getValue(endMessage.thankYouTitle, selectedLocale)"
          :placeholder="getPlaceholder(endMessage.thankYouTitle)"
          :disabled="selectedLocale === defaultLocale"
          :copyable="selectedLocale === defaultLocale"
          @update:model-value="
            updateValue('thankYouTitle', selectedLocale, $event)
          "
        />
      </div>

      <!-- Thank You Text -->
      <div class="space-y-2">
        <label class="block text-sm font-medium">
          {{ t('callout.builder.tabs.endMessage.inputs.text.label') }}
        </label>

        <AppRichTextEditor
          :model-value="getValue(endMessage.thankYouText, selectedLocale)"
          :placeholder="getPlaceholder(endMessage.thankYouText)"
          :disabled="selectedLocale === defaultLocale"
          :copyable="selectedLocale === defaultLocale"
          @update:model-value="
            updateValue('thankYouText', selectedLocale, $event)
          "
        />
      </div>
    </div>

    <div v-else class="space-y-2">
      <!-- Thank You Redirect -->
      <label class="block text-sm font-medium">
        {{ t('callout.builder.tabs.endMessage.inputs.url.label') }}
      </label>

      <AppInput
        :model-value="getValue(endMessage.thankYouRedirect, selectedLocale)"
        :placeholder="
          selectedLocale === defaultLocale
            ? ''
            : getPlaceholder(endMessage.thankYouRedirect)
        "
        :disabled="selectedLocale === defaultLocale"
        :copyable="selectedLocale === defaultLocale"
        @update:model-value="
          updateValue('thankYouRedirect', selectedLocale, $event)
        "
      />
    </div>
  </AppFormBox>
</template>

<script lang="ts" setup>
import { AppFormBox, AppInput, AppRichTextEditor } from '@beabee/vue';

import { useI18n } from 'vue-i18n';

import type { LocaleProp } from '#type';
import { getLocalizedValue, updateLocalizedValue } from '#utils/callouts';

import type { EndMessageTabData } from '../ContentTab/SidebarTabContent/EndMessageTab.vue';

const props = defineProps<{
  defaultLocale: string;
  selectedLocale: string;
  endMessage: EndMessageTabData;
}>();

const { t } = useI18n();

// Get end message value for a specific locale using utility function (no fallback)
function getValue(prop: LocaleProp | undefined, locale: string): string {
  return getLocalizedValue(prop, locale, props.defaultLocale, {
    useFallback: false,
  });
}

// Get fallback text for placeholder
function getPlaceholder(prop: LocaleProp | undefined): string {
  return getLocalizedValue(prop, props.selectedLocale, props.defaultLocale);
}

// Update end message value using utility function
function updateValue(
  field: 'thankYouTitle' | 'thankYouText' | 'thankYouRedirect',
  locale: string,
  value: string
): void {
  updateLocalizedValue(
    props.endMessage[field],
    locale,
    value,
    props.defaultLocale
  );
}
</script>
