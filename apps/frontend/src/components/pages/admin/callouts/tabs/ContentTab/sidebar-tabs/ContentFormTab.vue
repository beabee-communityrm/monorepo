<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="flex max-h-full min-h-0 flex-1 flex-col">
    <!-- Form Builder -->
    <FormBuilder
      :key="props.data.currentSlide.id"
      v-model="props.data.currentSlide.components"
      :advanced="props.data.showAdvanced"
      :slides="props.data.slides"
      class="min-h-0 flex-1"
    />

    <!-- Form Builder Footer -->
    <div class="flex gap-4">
      <div class="max-w-2xl flex-1">
        <!-- Slide ID -->
        <div class="flex justify-between">
          <div>
            <p v-if="props.data.showAdvanced" class="text-sm text-grey">
              {{ t('common.id') }}: {{ props.data.currentSlide.id }}
            </p>
          </div>
        </div>

        <!-- Translations -->
        <div v-if="props.data.hasLocales" class="my-4 bg-white p-6 shadow-md">
          <AppSubHeading>
            {{ t('calloutBuilder.translationsTitle') }}
          </AppSubHeading>
          <p class="mb-4">
            {{ t('calloutBuilder.translationsText') }}
          </p>

          <FormBuilderTranslations
            v-model="props.data.componentText"
            :components="props.data.currentSlide.components"
            :locales="props.data.locales"
            @update:model-value="handleComponentTextUpdate"
          />
        </div>
      </div>
      <div class="flex-0 basis-[15rem]" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import FormBuilder from '@components/form-builder/FormBuilder.vue';
import FormBuilderTranslations from '@components/form-builder/FormBuilderTranslations.vue';
import AppSubHeading from '@components/AppSubHeading.vue';
import type { FormBuilderSlide } from '@components/form-builder/form-builder.interface';
import type { LocaleProp } from '@type';
import type { SidebarTab } from '../SidebarTabs.vue';

/**
 * Data for the ContentFormTab component
 */
export interface ContentFormTabData {
  /** Current slide being edited */
  currentSlide: FormBuilderSlide;
  /** All slides in the form */
  slides: FormBuilderSlide[];
  /** Whether the form has multiple locales */
  hasLocales: boolean;
  /** Component text translations */
  componentText: Record<string, LocaleProp>;
  /** Available locales */
  locales: string[];
  /** Whether the form is in advanced mode */
  showAdvanced: boolean;
}

/**
 * Props for the ContentFormTab component
 */
export type ContentFormTabProps = SidebarTab<ContentFormTabData>;

const props = defineProps<ContentFormTabProps>();
const emit = defineEmits<{
  'update:data': [value: ContentFormTabData];
}>();

const { t } = useI18n();

const handleComponentTextUpdate = (
  value: Record<string, LocaleProp | undefined>
) => {
  emit('update:data', {
    ...props.data,
    componentText: value as Record<string, LocaleProp>,
  });
};
</script>
