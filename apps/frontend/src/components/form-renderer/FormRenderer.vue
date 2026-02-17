<template>
  <Form
    :key="componentTextChangeCounter"
    class="callout-form-renderer"
    :form="{ components: localizedComponents }"
    :submission="modelValue && { data: modelValue }"
    :options="formOpts"
    language="custom"
    @change="handleChange"
  />
</template>
<script lang="ts" setup>
import type {
  CalloutComponentSchema,
  CalloutResponseAnswersSlide,
} from '@beabee/beabee-common';
import { library } from '@beabee/vue/plugins/icons';

import { config, dom } from '@fortawesome/fontawesome-svg-core';
import {
  type IconName,
  faCalendar,
  faCamera,
  faCloudUpload,
  faCross,
  faPlus,
  faRefresh,
  faRemove,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import useVuelidate from '@vuelidate/core';
import { sameAs } from '@vuelidate/validators';
import { computed, onBeforeMount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  activeUploadsCount,
  resetActiveUploadsCount,
} from '#lib/formio/providers/storage/beabee';

import { Form } from '../../lib/formio';
import { type FormChangeEvent } from './form-renderer.interface';

const emit = defineEmits<{
  (e: 'update:modelValue', value: CalloutResponseAnswersSlide[string]): void;
}>();
const props = defineProps<{
  components: CalloutComponentSchema[];
  modelValue?: CalloutResponseAnswersSlide[string];
  readonly?: boolean;
  componentI18nText?: Record<string, string>;
}>();

const { t } = useI18n();

const isValid = ref(false);

// Custom validator to ensure no files are uploading
const notUploading = () => activeUploadsCount.value === 0;

useVuelidate(
  {
    isValid: {
      yes: sameAs(true),
      notUploading,
    },
  },
  { isValid }
);

function handleChange(evt: FormChangeEvent, changes?: { noValidate: boolean }) {
  // This handler gets lots of different change events. Use the second argument to
  // differentiate for the ones we care about.
  if (changes && !changes.noValidate) {
    isValid.value = evt.isValid;
    emit('update:modelValue', evt.data);
  }
}

/**
 * Apply translations to components before passing them to Form.io
 * This is necessary because we handle all translations ourselves instead of
 * relying on Form.io's i18n system for better control and consistency
 */
// Create a simple counter that changes when componentI18nText changes
const componentTextChangeCounter = ref(0);

// Watch for changes in componentI18nText and increment counter
watch(
  () => props.componentI18nText,
  () => {
    componentTextChangeCounter.value++;
  },
  { deep: true }
);

const localizedComponents = computed(() => {
  if (!props.componentI18nText) {
    return props.components;
  }

  const componentI18nText = props.componentI18nText;

  return props.components.map((component) => {
    const localizedComponent = { ...component } as Record<string, unknown>;

    // Handle content components with HTML property
    if (component.type === 'content' && 'html' in component) {
      const htmlProperty = component.html as string;
      const htmlTranslation = componentI18nText[htmlProperty];
      if (htmlTranslation) {
        localizedComponent.html = htmlTranslation;
      }
    }

    // Handle label translations for all components
    if (
      'label' in component &&
      component.label &&
      typeof component.label === 'string'
    ) {
      const labelTranslation = componentI18nText[component.label];
      if (labelTranslation) {
        localizedComponent.label = labelTranslation;
      }
    }

    // Handle description translations
    if (
      'description' in component &&
      component.description &&
      typeof component.description === 'string'
    ) {
      const descriptionTranslation = componentI18nText[component.description];
      if (descriptionTranslation) {
        localizedComponent.description = descriptionTranslation;
      }
    }

    // Handle placeholder translations
    if (
      'placeholder' in component &&
      component.placeholder &&
      typeof component.placeholder === 'string'
    ) {
      const placeholderTranslation = componentI18nText[component.placeholder];
      if (placeholderTranslation) {
        localizedComponent.placeholder = placeholderTranslation;
      }
    }

    // Handle options translations for select components
    if ('values' in component && Array.isArray(component.values)) {
      localizedComponent.values = component.values.map(
        (value: Record<string, unknown>) => {
          const labelTranslation =
            value.label && typeof value.label === 'string'
              ? componentI18nText[value.label]
              : undefined;
          return labelTranslation
            ? { ...value, label: labelTranslation }
            : value;
        }
      );
    }

    // Handle data.values translations for dropdown components
    if (
      'data' in component &&
      component.data &&
      typeof component.data === 'object' &&
      component.data !== null
    ) {
      const data = component.data as Record<string, unknown>;
      if ('values' in data && Array.isArray(data.values)) {
        localizedComponent.data = {
          ...data,
          values: data.values.map((value: Record<string, unknown>) => {
            const labelTranslation =
              value.label && typeof value.label === 'string'
                ? componentI18nText[value.label]
                : undefined;
            return labelTranslation
              ? { ...value, label: labelTranslation }
              : value;
          }),
        };
      }
    }

    return localizedComponent as CalloutComponentSchema;
  });
});

const formOpts = computed(() => {
  return {
    readOnly: props.readonly,
    noAlerts: true,
    renderMode: props.readonly ? 'html' : 'form',
    i18n: {
      custom: {
        'Drop files to attach,': t('formRenderer.components.file.dropFiles'),
        'use camera': t('formRenderer.components.file.useCamera'),
        or: t('formRenderer.components.file.or'),
        browse: t('formRenderer.components.file.browse'),
        'Take Picture': t('formRenderer.components.file.takePicture'),
        'Switch to file upload': t(
          'formRenderer.components.file.switchToFileUpload'
        ),
        'Add Another': t('formRenderer.components.multiple.addAnother'),
        required: t('form.errors.unknown.required'),
        invalid_email: t('form.errors.unknown.email'),
        invalid_url: t('form.errors.unknown.url'),
        minLength: t('form.errorsFormio.minLength'),
        maxLength: t('form.errorsFormio.maxLength'),
      },
    },
  };
});

onBeforeMount(() => {
  // Reset upload counter to ensure no stale counts from previous forms
  resetActiveUploadsCount();

  library.add(
    faCalendar,
    faCamera,
    faCross,
    faCloudUpload,
    faPlus,
    faRemove,
    faRefresh,

    // Use different icon names so they match
    { ...faTimesCircle, iconName: 'times-circle-o' as IconName }
  );
  config.autoReplaceSvg = 'nest';
  dom.watch();
});
</script>

<style>
@import '../../lib/formio/formio.form.css';
@import './form-renderer.css';
</style>
