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

          <AppInput
            v-if="fieldType === 'input'"
            :model-value="
              getLocalizedValue(component[field] as string, selectedLocale)
            "
            :placeholder="
              selectedLocale === defaultLocale
                ? ''
                : getDefaultText(component[field] as string)
            "
            :disabled="selectedLocale === defaultLocale"
            :copyable="selectedLocale === defaultLocale"
            @update:model-value="
              updateValue(component[field] as string, selectedLocale, $event)
            "
          />

          <AppTextArea
            v-else
            :model-value="
              getLocalizedValue(component[field] as string, selectedLocale)
            "
            :placeholder="
              selectedLocale === defaultLocale
                ? ''
                : getDefaultText(component[field] as string)
            "
            :disabled="selectedLocale === defaultLocale"
            :copyable="selectedLocale === defaultLocale"
            rows="3"
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
            :placeholder="
              selectedLocale === defaultLocale
                ? ''
                : getDefaultText(value.label)
            "
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
import { useI18n } from 'vue-i18n';
import type { CalloutComponentSchema } from '@beabee/beabee-common';
import type { FormBuilderSlide } from '@components/form-builder/form-builder.interface';
import type { LocaleProp } from '@type/locale-prop';
import AppInput from '@components/forms/AppInput.vue';
import AppTextArea from '@components/forms/AppTextArea.vue';
import { AppFormBox } from '@beabee/vue/components';

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
] as const;

// Get the default text for a field
function getDefaultText(ref: string | undefined = ''): string {
  return getLocalizedValue(ref, props.defaultLocale);
}

// Get the localized value for a specific locale
function getLocalizedValue(
  ref: string | undefined = '',
  locale: string
): string {
  if (!ref) return '';

  const value = props.componentText[ref];
  if (!value) return '';

  if (locale === props.defaultLocale) {
    return value.default || ref;
  }

  return value[locale] || '';
}

// Update a translation value
function updateValue(
  ref: string | undefined = '',
  locale: string,
  value: string
): void {
  if (!ref) return;

  const currentValue = props.componentText[ref] || { default: ref };
  const newValue = { ...currentValue };

  if (locale === props.defaultLocale) {
    newValue.default = value;
  } else {
    newValue[locale] = value;
  }

  // eslint-disable-next-line vue/no-mutating-props
  props.componentText[ref] = newValue;
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
