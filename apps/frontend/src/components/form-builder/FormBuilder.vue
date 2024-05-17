<template>
  <FormBuilder
    ref="formBuilderRef"
    class="callout-form-builder"
    :form="{ components: modelValue }"
    :options="{
      ...formOpts,
      formConfig: {
        slides: slides?.map((s) => ({ value: s.id, label: s.title })),
      },
    }"
    @change="handleChange"
  />
</template>
<script lang="ts" setup>
import {
  faQuestionCircle,
  faTerminal,
  faFont,
  faHashtag,
  faAsterisk,
  faCheckSquare,
  faPlusSquare,
  faThList,
  faDotCircle,
  faStop,
  faCog,
  faArrowsAlt,
  faWrench,
  faCopy,
  faTimes,
  faBars,
  faTimesCircle,
  faPlus,
  faCode,
  faColumns,
  faThLarge,
  faListAlt,
  faTable,
  faFolder,
  faSquare,
  faParagraph,
  faAt,
  faLink,
  faPhoneSquare,
  faTags,
  faHome,
  faCalendar,
  faClock,
  faUsd,
  faList,
  faPencil,
  faRefresh,
  faCloudUpload,
  faCamera,
  type IconName,
} from '@fortawesome/free-solid-svg-icons';
import {
  config,
  dom,
  library,
  noAuto,
} from '@fortawesome/fontawesome-svg-core';
import { onBeforeMount, onBeforeUnmount, ref, toRef, watch } from 'vue';

import { FormBuilder } from '../../lib/formio';
import type { CalloutComponentSchema } from '@beabee/beabee-common';
import {
  formOpts,
  type FormBuilderRef,
  type FormBuilderSlide,
} from './form-builder.interface';

const emit = defineEmits<{
  (e: 'update:modelValue', components: CalloutComponentSchema[]): void;
}>();

const props = defineProps<{
  modelValue: CalloutComponentSchema[];
  advanced?: boolean;
  slides?: FormBuilderSlide[];
}>();

const formBuilderRef = ref<FormBuilderRef>();

function handleChange() {
  if (!formBuilderRef.value) return;
  emit('update:modelValue', formBuilderRef.value.builder.form.components);
}

watch(toRef(props, 'advanced'), (show) => {
  document.body.classList.toggle('show-advanced-options', show);
});

onBeforeMount(() => {
  library.add(
    faQuestionCircle,
    faTerminal,
    faFont,
    faHashtag,
    faAsterisk,
    faCheckSquare,
    faPlusSquare,
    faThList,
    faStop,
    faCog,
    faWrench,
    faCopy,
    faBars,
    faPlus,
    faCode,
    faColumns,
    faThLarge,
    faListAlt,
    faTable,
    faAt,
    faLink,
    faPhoneSquare,
    faTags,
    faHome,
    faCalendar,
    faUsd,
    faList,
    faPencil,
    faRefresh,
    faCloudUpload,
    faCamera,

    // Use different icon names so they match
    { ...faClock, iconName: 'clock-o' as IconName },
    { ...faParagraph, iconName: 'html5' },
    { ...faFolder, iconName: 'folder-o' as IconName },
    { ...faSquare, iconName: 'square-o' as IconName },
    { ...faTimesCircle, iconName: 'times-circle-o' as IconName },
    { ...faDotCircle, iconName: 'dot-circle-o' as IconName },
    { ...faArrowsAlt, iconName: 'arrows' },
    { ...faTimes, iconName: 'remove' as IconName }
  );
  // This will automatically replace all <i> tags with the icons above
  config.autoReplaceSvg = 'nest';
  dom.watch();
});

onBeforeUnmount(() => {
  noAuto();
  document.body.classList.remove('show-advanced-options');
});
</script>
<style lang="postcss">
@import '../../lib/formio/formio.builder.css';
@import '../form-renderer/form-renderer.css';
@import './form-builder.css';
</style>
