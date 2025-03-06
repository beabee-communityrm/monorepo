<template>
  <div class="bg-grey-lighter p-4">
    <AppTabCard v-model="selectedLocale" :items="localeItems">
      <template #default="{ selected }">
        <div
          v-for="component in components"
          :key="component.id"
          class="mb-8 border-t border-t-primary-20 pt-6"
        >
          <h3 class="mb-2 font-title text-xl font-semibold">
            {{ component.label }}
          </h3>

          <!-- Standard fields (label, description, placeholder) -->
          <div
            v-for="[field, fieldComponent] in fields"
            :key="field"
            class="mb-4"
          >
            <component
              :is="fieldComponent"
              v-if="component[field]"
              :model-value="getValue(component[field] as string | undefined)"
              :label="t('calloutBuilder.translationFields.' + field)"
              :locales="selected === defaultLocale ? [] : [selected]"
              :readonly-default="selected !== defaultLocale"
              required
              @update:model-value="
                setValue(component[field] as string | undefined, $event)
              "
            />
          </div>

          <!-- Options for select, radio, etc. -->
          <div
            v-for="(value, i) in getOptions(component)"
            :key="value.value"
            class="mb-4"
          >
            <LocaleInput
              :model-value="getValue(value.label)"
              :label="
                t('calloutBuilder.translationFields.option', { n: i + 1 })
              "
              :locales="selected === defaultLocale ? [] : [selected]"
              :readonly-default="selected !== defaultLocale"
              required
              @update:model-value="setValue(value.label, $event)"
            />
          </div>
        </div>
      </template>
    </AppTabCard>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { CalloutComponentSchema } from '@beabee/beabee-common';
import { AppTabCard } from '@beabee/vue/components/tabs';
import type { TabItem } from '@beabee/vue/components/tabs';
import type { LocaleProp } from '@type';
import LocaleInput from '@components/forms/LocaleInput.vue';
import LocaleTextArea from '@components/forms/LocaleTextArea.vue';

const props = defineProps<{
  modelValue: Record<string, LocaleProp | undefined>;
  components: CalloutComponentSchema[];
  locales: string[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: Record<string, LocaleProp | undefined>): void;
}>();

const { t } = useI18n();

// Default locale is always the first one
const defaultLocale = computed(() => props.locales[0] || 'en');

// Currently selected locale tab
const selectedLocale = ref(defaultLocale.value);

// Convert locales to tab items
const localeItems = computed<TabItem[]>(() =>
  props.locales.map((locale) => ({
    id: locale,
    label: getLocaleLabel(locale),
  }))
);

// Field types mapping
const fields = [
  ['label', LocaleInput],
  ['description', LocaleTextArea],
  ['placeholder', LocaleInput],
] as const;

// Helper function to get a human-readable locale name
function getLocaleLabel(locale: string): string {
  const localeNames: Record<string, string> = {
    en: 'English',
    de: 'Deutsch',
    fr: 'Français',
    es: 'Español',
    pt: 'Português',
    it: 'Italiano',
    // Add more as needed
  };

  return localeNames[locale] || locale.toUpperCase();
}

// Get value for a field
function getValue(ref: string | undefined = ''): LocaleProp {
  return props.modelValue[ref] || { default: ref };
}

// Set value for a field
function setValue(ref: string | undefined = '', val: LocaleProp) {
  emit('update:modelValue', { ...props.modelValue, [ref]: val });
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
