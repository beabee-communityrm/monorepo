<template>
  <AppFormBox
    :title="
      t('callout.builder.navigation.slideNo', {
        no: slideIndex + 1,
      }) +
      ': ' +
      slide.title
    "
  >
    <div v-for="component in slide.components" :key="component.id" class="mb-8">
      <h3 class="mb-2 font-semibold">
        {{ component.label }}
      </h3>

      <!-- Standard fields (label, description, placeholder) -->
      <div v-for="[field, fieldType] in fields" :key="field" class="mb-4">
        <div v-if="component[field]" class="space-y-2">
          <label class="block text-sm font-medium">
            {{ t('callout.builder.translationFields.' + field) }}
          </label>

          <!-- Input field -->
          <AppInput
            v-if="fieldType === 'input'"
            :model-value="
              getLocalizedValue(component[field] as string, selectedLocale)
            "
            :placeholder="getDefaultText(component[field] as string)"
            :disabled="selectedLocale === defaultLocale"
            :copyable="selectedLocale === defaultLocale"
            @update:model-value="
              updateValue(component[field] as string, selectedLocale, $event)
            "
          />

          <!-- Textarea field -->
          <AppTextArea
            v-else-if="fieldType === 'textarea'"
            :model-value="
              getLocalizedValue(component[field] as string, selectedLocale)
            "
            :placeholder="getDefaultText(component[field] as string)"
            :disabled="selectedLocale === defaultLocale"
            :copyable="selectedLocale === defaultLocale"
            rows="3"
            @update:model-value="
              updateValue(component[field] as string, selectedLocale, $event)
            "
          />

          <!-- Rich text editor field -->
          <RichTextEditor
            v-else-if="fieldType === 'richtext'"
            :model-value="
              getLocalizedValue(component[field] as string, selectedLocale)
            "
            :placeholder="getDefaultText(component[field] as string)"
            :disabled="selectedLocale === defaultLocale"
            :copyable="selectedLocale === defaultLocale"
            @update:model-value="
              updateValue(component[field] as string, selectedLocale, $event)
            "
          />
        </div>
      </div>

      <!-- Options for select, radio, etc. -->
      <div
        v-for="(value, i) in getOptions(component)"
        :key="value.value"
        class="mb-4"
      >
        <div class="space-y-2">
          <label class="block text-sm font-medium">
            {{
              t('callout.builder.translationFields.option', {
                n: i + 1,
              })
            }}
          </label>

          <AppInput
            :model-value="getLocalizedValue(value.label, selectedLocale)"
            :placeholder="getDefaultText(value.label)"
            :disabled="selectedLocale === defaultLocale"
            :copyable="selectedLocale === defaultLocale"
            @update:model-value="
              updateValue(value.label, selectedLocale, $event)
            "
          />
        </div>
      </div>
    </div>
  </AppFormBox>
</template>

<script lang="ts" setup>
import { type CalloutComponentSchema } from '@beabee/beabee-common';
import { AppFormBox } from '@beabee/vue/components';

import type { FormBuilderSlide } from '@components/form-builder/form-builder.interface';
import AppInput from '@components/forms/AppInput.vue';
import AppTextArea from '@components/forms/AppTextArea.vue';
import RichTextEditor from '@components/rte/RichTextEditor.vue';
import type { LocaleProp } from '@type/locale-prop';
import {
  getComponentTextFallback,
  getComponentTextValueNoFallback,
  updateComponentTextValue,
} from '@utils/callouts';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  defaultLocale: string;
  selectedLocale: string;
  componentText: Record<string, LocaleProp>;
  slide: FormBuilderSlide;
  slideIndex: number;
}>();

const { t } = useI18n();

// Field types mapping
const fields = [
  ['label', 'input'],
  ['description', 'textarea'],
  ['placeholder', 'input'],
  ['html', 'richtext'],
] as const;

// Get the fallback text for placeholder in translation UI
function getDefaultText(ref: string | undefined = ''): string {
  return getComponentTextFallback(
    props.componentText,
    ref,
    props.selectedLocale,
    props.defaultLocale
  );
}

// Get only the specific translation for a locale without fallback (for translation UI)
function getLocalizedValue(
  ref: string | undefined = '',
  locale: string
): string {
  return getComponentTextValueNoFallback(
    props.componentText,
    ref,
    locale,
    props.defaultLocale
  );
}

// Update a translation value using the utility function
function updateValue(
  ref: string | undefined = '',
  locale: string,
  value: string
): void {
  updateComponentTextValue(
    props.componentText,
    ref,
    locale,
    value,
    props.defaultLocale
  );
}

// Get options for select, radio, etc. components
function getOptions(
  component: CalloutComponentSchema
): { label: string; value: string }[] {
  if (component.type === 'radio' || component.type === 'selectboxes') {
    return component.values;
  } else if (component.type === 'select') {
    return component.data.values;
  } else {
    return [];
  }
}
</script>
