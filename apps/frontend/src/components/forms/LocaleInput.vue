<template>
  <div v-if="readonlyDefault">
    <AppLabel :label="label" />
    {{ modelValue.default }}
  </div>
  <AppInput
    v-else
    :model-value="modelValue.default"
    :label="label"
    v-bind="$attrs"
    @update:model-value="
      emit('update:modelValue', { ...modelValue, default: $event })
    "
  />
  <div v-for="locale in locales" :key="locale" class="mt-1.5">
    <AppInput
      :model-value="modelValue[locale] || ''"
      :label="`${label} (${locale})`"
      v-bind="$attrs"
      @update:model-value="
        emit('update:modelValue', { ...modelValue, [locale]: $event })
      "
    />
  </div>
</template>
<script lang="ts" setup>
import AppInput from '@components/forms/AppInput.vue';
import AppLabel from '@components/forms/AppLabel.vue';
import type { LocaleInputProps } from '@type';

const emit = defineEmits(['update:modelValue']);
defineOptions({ inheritAttrs: false });
defineProps<LocaleInputProps>();
</script>
