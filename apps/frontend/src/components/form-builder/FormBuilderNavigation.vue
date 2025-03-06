<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="mb-4 flex flex-col gap-4">
    <div v-if="!isFirst" class="flex-1">
      <LocaleInput
        v-model="modelValue.prevText"
        :label="t('calloutBuilder.prevButton')"
        :locales="locales"
        required
      />
    </div>

    <div v-if="isLast" class="flex-1">
      <LocaleInput
        v-model="modelValue.submitText"
        :label="t('calloutBuilder.submitButton')"
        :locales="locales"
        required
      />
    </div>
    <div v-else>
      <div class="mb-4">
        <LocaleInput
          v-model="modelValue.nextText"
          :label="t('calloutBuilder.nextButton')"
          :locales="locales"
          required
        />
      </div>
      <AppSelect
        v-model="modelValue.nextSlideId"
        :label="t('calloutBuilder.nextSlide.label')"
        :items="[
          {
            id: '',
            label: t('calloutBuilder.nextSlide.default'),
          },
          ...slideItems,
        ]"
      />
      <!-- </template> -->
    </div>
  </div>
</template>
<script lang="ts" setup>
// TODO: Move locales and translations to apps/frontend/src/components/pages/admin/callouts/tabs/TranslationsTab.vue
// Maybe in form of a new component
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';

import LocaleInput from '@components/forms/LocaleInput.vue';
import AppSelect from '@components/forms/AppSelect.vue';
import type {
  FormBuilderNavigation,
  FormBuilderSlide,
} from './form-builder.interface';

defineEmits<{
  (e: 'update:modelValue', value: FormBuilderNavigation): void;
}>();
const props = defineProps<{
  slides: FormBuilderSlide[];
  isFirst: boolean;
  isLast: boolean;
  modelValue: FormBuilderNavigation;
  locales: string[];
}>();

const { t } = useI18n();

const slideItems = computed(() =>
  props.slides.map((s) => ({ id: s.id, label: s.title }))
);
</script>
