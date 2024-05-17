<template>
  <div>
    <RichTextEditor
      :model-value="modelValue.default"
      :label="label"
      v-bind="$attrs"
      @update:model-value="
        emit('update:modelValue', { ...modelValue, default: $event })
      "
    />
    <RichTextEditor
      v-for="locale in locales"
      :key="locale"
      :model-value="modelValue[locale] || ''"
      :label="`${label} (${locale})`"
      v-bind="$attrs"
      class="mt-1.5"
      @update:model-value="
        emit('update:modelValue', { ...modelValue, [locale]: $event })
      "
    />
  </div>
</template>
<script lang="ts" setup>
import RichTextEditor from '@components/rte/RichTextEditor.vue';
import type { LocaleInputProps } from '@type';

const emit = defineEmits(['update:modelValue']);
defineOptions({ inheritAttrs: false });
defineProps<LocaleInputProps>();
</script>
