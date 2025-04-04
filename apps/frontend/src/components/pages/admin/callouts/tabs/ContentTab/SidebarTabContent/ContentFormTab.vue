<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="flex max-h-full min-h-0 flex-1 flex-col">
    <!-- Form Builder -->
    <FormBuilder
      :key="data.currentSlide.id"
      v-model="data.currentSlide.components"
      :advanced="data.showAdvanced"
      :slides="data.slides"
      class="min-h-0 flex-1"
    />

    <!-- Form Builder Footer -->
    <div class="flex gap-4">
      <div class="max-w-2xl flex-1">
        <!-- Slide ID -->
        <div class="flex justify-between">
          <div>
            <p v-if="data.showAdvanced" class="text-sm text-grey">
              {{ t('common.id') }}: {{ data.currentSlide.id }}
            </p>
          </div>
        </div>
      </div>
      <div class="flex-0 basis-[15rem]" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import FormBuilder from '@components/form-builder/FormBuilder.vue';
import type { FormBuilderSlide } from '@components/form-builder/form-builder.interface';
import type { LocaleProp } from '@type';
import type { SidebarTabProps } from '../SidebarTabs.interface';

/**
 * Data for the ContentFormTab component
 */
export interface ContentFormTabData {
  /** Current slide being edited */
  currentSlide: FormBuilderSlide;
  /** All slides in the form */
  slides: FormBuilderSlide[];
  /** Component text translations */
  componentText: Record<string, LocaleProp>;
  /** Whether the form is in advanced mode */
  showAdvanced: boolean;
}

/**
 * Props for the ContentFormTab component
 */
export type ContentFormTabProps = SidebarTabProps<ContentFormTabData> & {
  locales?: string[];
};

defineProps<ContentFormTabProps>();
defineEmits<{
  'update:data': [value: ContentFormTabData];
}>();

const { t } = useI18n();
</script>
