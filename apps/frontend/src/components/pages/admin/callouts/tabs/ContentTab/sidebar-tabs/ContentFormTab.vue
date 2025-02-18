<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="callout-slide-builder flex h-full flex-col overflow-y-hidden">
    <!-- Form Builder Options -->
    <div class="mb-4 flex flex-none items-end gap-4">
      <div class="flex-none basis-60">
        <AppCheckbox
          v-if="env.experimentalFeatures"
          v-model:checked="showAdvancedOptions"
          :label="t('calloutBuilder.showAdvancedOptions')"
          @update:checked="handleAdvancedOptionsUpdate"
        />
      </div>
    </div>

    <!-- Form Builder -->
    <FormBuilder
      :key="currentSlide.id"
      v-model="currentSlide.components"
      :advanced="showAdvancedOptions"
      :slides="slides"
      class="min-h-0 flex-1"
    />

    <!-- Form Builder Footer -->
    <div class="flex gap-4">
      <div class="max-w-2xl flex-1">
        <!-- Slide ID -->
        <div class="flex justify-between">
          <div>
            <p v-if="showAdvancedOptions" class="text-sm text-grey">
              {{ t('common.id') }}: {{ currentSlide.id }}
            </p>
          </div>
        </div>

        <!-- Translations -->
        <div v-if="hasLocales" class="my-4 bg-white p-6 shadow-md">
          <AppSubHeading>
            {{ t('calloutBuilder.translationsTitle') }}
          </AppSubHeading>
          <p class="mb-4">
            {{ t('calloutBuilder.translationsText') }}
          </p>

          <FormBuilderTranslations
            v-model="props.componentText"
            :components="currentSlide.components"
            :locales="locales"
            @update:model-value="handleComponentTextUpdate"
          />
        </div>
      </div>
      <div class="flex-0 basis-[15rem]" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import AppCheckbox from '@components/forms/AppCheckbox.vue';
import FormBuilder from '@components/form-builder/FormBuilder.vue';
import FormBuilderTranslations from '@components/form-builder/FormBuilderTranslations.vue';
import AppSubHeading from '@components/AppSubHeading.vue';
import env from '@env';
import type { FormBuilderSlide } from '@components/form-builder/form-builder.interface';
import type { LocaleProp } from '@type';

interface Props {
  /** Current slide being edited */
  currentSlide: FormBuilderSlide;
  /** All slides in the form */
  slides: FormBuilderSlide[];
  /** Show advanced options in form builder */
  showAdvanced: boolean;
  /** Whether the form has multiple locales */
  hasLocales: boolean;
  /** Component text translations */
  componentText: Record<string, LocaleProp>;
  /** Available locales */
  locales: string[];
}

const props = withDefaults(defineProps<Props>(), {
  showAdvanced: false,
  hasLocales: false,
});
const emit = defineEmits<{
  'update:currentSlide': [value: FormBuilderSlide];
  'update:componentText': [value: Record<string, LocaleProp | undefined>];
  'update:showAdvanced': [value: boolean];
}>();

const { t } = useI18n();

const showAdvancedOptions = ref(props.showAdvanced);

// Watch for prop changes
watch(
  () => props.showAdvanced,
  (newValue) => {
    showAdvancedOptions.value = newValue;
  }
);

// Event handlers
const handleAdvancedOptionsUpdate = (value: boolean) => {
  emit('update:showAdvanced', value);
};

const handleComponentTextUpdate = (
  value: Record<string, LocaleProp | undefined>
) => {
  emit('update:componentText', value);
};
</script>
