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
import type { CalloutComponentSchema } from '@beabee/beabee-common';
import { library } from '@beabee/vue/plugins/icons';

import { config, dom, noAuto } from '@fortawesome/fontawesome-svg-core';
import {
  type IconName,
  faArrowsAlt,
  faAsterisk,
  faAt,
  faBars,
  faCalendar,
  faCamera,
  faCheckSquare,
  faClock,
  faCloudUpload,
  faCode,
  faCog,
  faColumns,
  faCopy,
  faDotCircle,
  faFolder,
  faFont,
  faHashtag,
  faHome,
  faLink,
  faList,
  faListAlt,
  faParagraph,
  faPencil,
  faPhoneSquare,
  faPlus,
  faPlusSquare,
  faQuestionCircle,
  faRefresh,
  faSquare,
  faStop,
  faTable,
  faTags,
  faTerminal,
  faThLarge,
  faThList,
  faTimes,
  faTimesCircle,
  faUsd,
  faWrench,
} from '@fortawesome/free-solid-svg-icons';
import { onBeforeMount, onBeforeUnmount, ref } from 'vue';

import { FormBuilder } from '../../lib/formio';
import {
  type FormBuilderRef,
  type FormBuilderSlide,
  formOpts,
} from './form-builder.interface';

const emit = defineEmits<{
  (e: 'update:modelValue', components: CalloutComponentSchema[]): void;
}>();

defineProps<{
  modelValue: CalloutComponentSchema[];
  slides?: FormBuilderSlide[];
}>();

const formBuilderRef = ref<FormBuilderRef>();

function handleChange() {
  if (!formBuilderRef.value) return;
  emit('update:modelValue', formBuilderRef.value.builder.form.components);
}

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
});
</script>
<style lang="postcss">
@import '../../lib/formio/formio.builder.css';
@import '../form-renderer/form-renderer.css';
@import './form-builder.css';
</style>
