<template>
  <Form
    :key="formOptsChanged"
    class="callout-form-renderer"
    :form="{ components }"
    :submission="modelValue && ({ data: modelValue } as any)"
    :options="formOpts"
    language="custom"
    @change="handleChange"
  />
</template>
<script lang="ts" setup>
import type {
  CalloutComponentSchema,
  CalloutResponseAnswers,
} from '@beabee/beabee-common';
import { computed, onBeforeMount, ref } from 'vue';
import { Form } from '../../lib/formio';
import { type FormChangeEvent } from './form-renderer.interface';
import { config, dom, library } from '@fortawesome/fontawesome-svg-core';
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
  (e: 'update:modelValue', value: CalloutResponseAnswers[string]): void;
}>();
const props = defineProps<{
  components: CalloutComponentSchema[];
  modelValue?: CalloutResponseAnswers[string];
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
