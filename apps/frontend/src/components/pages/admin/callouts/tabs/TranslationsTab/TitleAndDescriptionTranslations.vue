<template>
  <AppFormBox :title="t('callout.builder.tabs.titleAndImage.title')">
    <!-- Title -->
    <div class="mb-6 space-y-2">
      <label class="block text-sm font-medium">
        {{ t('callout.builder.tabs.titleAndImage.inputs.title.label') }}
      </label>

      <AppInput
        :model-value="getValue('title', selectedLocale)"
        :placeholder="titleAndImageData.title.default"
        :disabled="selectedLocale === defaultLocale"
        :copyable="selectedLocale === defaultLocale"
        @update:model-value="updateValue('title', selectedLocale, $event)"
      />
    </div>

    <!-- Description -->
    <div class="mb-6 space-y-2">
      <label class="block text-sm font-medium">
        {{ t('callout.builder.tabs.titleAndImage.inputs.description.label') }}
      </label>

      <AppTextArea
        :model-value="getValue('description', selectedLocale)"
        :placeholder="
          selectedLocale === defaultLocale
            ? ''
            : titleAndImageData.description.default
        "
        :disabled="selectedLocale === defaultLocale"
        :copyable="selectedLocale === defaultLocale"
        rows="3"
        @update:model-value="updateValue('description', selectedLocale, $event)"
      />
    </div>

    <!-- Share Title (if overrideShare is true) -->
    <div v-if="titleAndImageData.overrideShare" class="mb-6 space-y-2">
      <label class="block text-sm font-medium">
        {{ t('callout.builder.tabs.titleAndImage.inputs.shareTitle.label') }}
      </label>

      <AppInput
        :model-value="getValue('shareTitle', selectedLocale)"
        :placeholder="
          selectedLocale === defaultLocale
            ? ''
            : titleAndImageData.shareTitle.default
        "
        :disabled="selectedLocale === defaultLocale"
        :copyable="selectedLocale === defaultLocale"
        @update:model-value="updateValue('shareTitle', selectedLocale, $event)"
      />
    </div>

    <!-- Share Description (if overrideShare is true) -->
    <div v-if="titleAndImageData.overrideShare" class="mb-6 space-y-2">
      <label class="block text-sm font-medium">
        {{
          t('callout.builder.tabs.titleAndImage.inputs.shareDescription.label')
        }}
      </label>

      <AppTextArea
        :model-value="getValue('shareDescription', selectedLocale)"
        :placeholder="
          selectedLocale === defaultLocale
            ? ''
            : titleAndImageData.shareDescription.default
        "
        :disabled="selectedLocale === defaultLocale"
        :copyable="selectedLocale === defaultLocale"
        rows="3"
        @update:model-value="
          updateValue('shareDescription', selectedLocale, $event)
        "
      />
    </div>
  </AppFormBox>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import type { TitleAndImageTabData } from '../TitleAndImageTab.vue';
import AppTextArea from '@components/forms/AppTextArea.vue';
import { AppFormBox } from '@beabee/vue/components';
import AppInput from '@components/forms/AppInput.vue';
import { getLocalizedValue, updateLocalizedValue } from '@utils/callouts';

const props = defineProps<{
  defaultLocale: string;
  selectedLocale: string;
  titleAndImageData: TitleAndImageTabData;
}>();

const { t } = useI18n();

// Get title and description value for a specific locale using utility function
function getValue(
  field: 'title' | 'description' | 'shareTitle' | 'shareDescription',
  locale: string
): string {
  return getLocalizedValue(
    props.titleAndImageData[field],
    locale,
    props.defaultLocale
  );
}

// Update title and description value using utility function
function updateValue(
  field: 'title' | 'description' | 'shareTitle' | 'shareDescription',
  locale: string,
  value: string
): void {
  updateLocalizedValue(
    props.titleAndImageData[field],
    locale,
    value,
    props.defaultLocale
  );
}
</script>
