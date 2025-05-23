<template>
  <Form
    :key="formOptsChanged"
    class="callout-form-renderer"
    :form="{ components: localizedComponents }"
    :submission="modelValue && ({ data: modelValue } as any)"
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
import { computed, onBeforeMount, ref } from 'vue';
import { Form } from '../../lib/formio';
import { type FormChangeEvent } from './form-renderer.interface';
import { config, dom } from '@fortawesome/fontawesome-svg-core';
import { library } from '@beabee/vue/plugins/icons';
import {
  faCalendar,
  faCloudUpload,
  faCross,
  faRefresh,
  faRemove,
  faTimesCircle,
  faCamera,
  type IconName,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { useI18n } from 'vue-i18n';
import useVuelidate from '@vuelidate/core';
import { sameAs } from '@vuelidate/validators';

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

useVuelidate({ isValid: { yes: sameAs(true) } }, { isValid });

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
 * This is only necessary for content components because Form.io renders their
 * HTML property directly without using the i18n system, unlike other component
 * properties (label, description, placeholder) which are automatically translated
 * by Form.io's built-in i18n mechanism via formOpts.i18n.custom
 */
const localizedComponents = computed(() => {
  if (!props.componentI18nText) {
    return props.components;
  }

  const componentI18nText = props.componentI18nText;

  return props.components.map((component) => {
    // Only process content components with HTML property
    if (component.type === 'content' && 'html' in component) {
      const htmlProperty = component.html as string;
      const htmlTranslation = componentI18nText[htmlProperty];
      if (htmlTranslation) {
        return {
          ...component,
          html: htmlTranslation,
        } as CalloutComponentSchema;
      }
    }

    // For all other components, Form.io's i18n system handles translations automatically
    return component;
  });
});

const formOptsChanged = ref(0);
const formOpts = computed(
  () => ({
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
        ...props.componentI18nText,
      },
    },
  }),
  { onTrigger: () => formOptsChanged.value++ }
);

onBeforeMount(() => {
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
