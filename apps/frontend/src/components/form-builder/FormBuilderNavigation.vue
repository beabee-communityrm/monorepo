<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="mb-4 flex gap-8">
    <div class="flex-1">
      <div v-if="!isFirst">
        <LocaleInput
          v-model="modelValue.prevText"
          :label="t('calloutBuilder.prevButton')"
          :locales="locales"
          required
        />
      </div>
    </div>
    <div class="flex-1">
      <div v-if="isLast">
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
  </div>
</template>
<script lang="ts" setup>
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
