<template>
  <div>
    <div v-if="readonlyDefault">
      <AppLabel :label="label" :for="`${id}-default`" />
      <p :id="`${id}-default`" class="text-body-80">{{ modelValue.default }}</p>
    </div>
    <AppTextArea
      v-else
      :id="`${id}-default`"
      :model-value="modelValue.default"
      :label="label"
      v-bind="$attrs"
      @update:model-value="
        emit('update:modelValue', { ...modelValue, default: $event })
      "
    />
    <div v-for="locale in locales" :key="locale" class="mt-1.5">
      <AppTextArea
        :id="`${id}-${locale}`"
        :model-value="modelValue[locale] || ''"
        :label="`${label} (${locale})`"
        :aria-label="`${label} in ${locale}`"
        v-bind="$attrs"
        @update:model-value="
          emit('update:modelValue', { ...modelValue, [locale]: $event })
        "
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
// Deprecated, use FormBuilderTranslationsTabCard instead
import { computed } from 'vue';
import AppTextArea from '@components/forms/AppTextArea.vue';
import AppLabel from '@beabee/vue/components/form/AppLabel';
import type { LocaleInputProps } from '@type';

const emit = defineEmits(['update:modelValue']);
defineOptions({ inheritAttrs: false });
defineProps<LocaleInputProps>();

// Generate unique ID for aria-labels and form associations
const id = computed(
  () => `locale-textarea-${Math.random().toString(36).substring(2, 11)}`
);
</script>
