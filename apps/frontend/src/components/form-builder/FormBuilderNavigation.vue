<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="mb-4 flex flex-col gap-4">
    <div v-if="!isFirst" class="flex-1">
      <AppInput
        v-model="modelValue.prevText.default"
        :label="t('callout.builder.navigation.prevButton')"
        required
      />
    </div>

    <div v-if="isLast" class="flex-1">
      <AppInput
        v-model="modelValue.submitText.default"
        :label="t('callout.builder.navigation.submitButton')"
        required
      />
    </div>
    <div v-else>
      <div class="mb-4">
        <AppInput
          v-model="modelValue.nextText.default"
          :label="t('callout.builder.navigation.nextButton')"
          required
        />
      </div>
      <AppSelect
        v-model="modelValue.nextSlideId"
        :label="t('callout.builder.navigation.nextSlide.label')"
        :items="[
          {
            id: '',
            label: t('callout.builder.navigation.nextSlide.default'),
          },
          ...slideItems,
        ]"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
// Translations moved to TranslationsTab
import { AppInput } from '@beabee/vue';

import AppSelect from '@components/forms/AppSelect.vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

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
}>();

const { t } = useI18n();

const slideItems = computed(() =>
  props.slides.map((s) => ({ id: s.id, label: s.title }))
);
</script>
