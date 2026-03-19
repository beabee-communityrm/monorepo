<!--
  # AppIconPicker
  An icon picker for selecting from a searchable set of Font Awesome icons.
-->

<template>
  <div class="grid grid-cols-[auto_1fr] items-center gap-2">
    <font-awesome-icon
      :icon="[modelValue.prefix, modelValue.name]"
      class="text-2xl"
    />
    <AppSearchInput v-model="iconSearchValue" placeholder="Search..." />
  </div>
  <div class="mt-4 grid grid-cols-5 gap-4 pl-7">
    <div
      v-for="(icon, idx) in icons"
      :key="idx"
      class="flex flex-col items-center"
    >
      <AppButton
        size="xs"
        :variant="'dangerGhost'"
        @click="setIcon(props.iconStyle, icon.name)"
      >
        <font-awesome-icon :icon="[props.iconStyle, icon.name]" />
      </AppButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type CalloutMapSchemaIconStylingAnswerIconDefinition } from '@beabee/beabee-common';
import { IconSearchService, formatIconForDisplay } from '@beabee/fontawesome';

import useVuelidate from '@vuelidate/core';
import { computed, ref } from 'vue';

import AppButton from '../button/AppButton.vue';
import AppSearchInput from './AppSearchInput.vue';

/** Font Awesome icon set style (prefix: fas, far, fal, fad, fab). */
export type AppIconPickerIconStyle =
  | 'solid'
  | 'regular'
  | 'light'
  | 'duotone'
  | 'brands';

export interface AppIconPickerProps {
  id: string;
  modelValue: CalloutMapSchemaIconStylingAnswerIconDefinition;
  /** Max number of icons shown in the grid. Default: 25 */
  limit?: number;
  /** Icon set style. Named iconStyle to avoid collision with native HTML `style` attribute. Default: "solid" */
  iconStyle?: AppIconPickerIconStyle;
  /** Initial search query in the input. Default: "location" */
  initialSearchQuery?: string;
}

const emit = defineEmits(['update:modelValue']);

const props = withDefaults(defineProps<AppIconPickerProps>(), {
  limit: 25,
  iconStyle: 'solid',
  initialSearchQuery: 'location',
});

const validation = useVuelidate();

const iconSearchValue = ref<string>(props.initialSearchQuery);

const iconService = new IconSearchService();

const icons = computed(() => {
  return iconService
    .filterIcons({
      styles: [props.iconStyle],
      query: iconSearchValue.value,
      limit: props.limit,
    })
    .map((icon) => {
      return formatIconForDisplay(icon);
    });
});

function setIcon(prefix: string, name: string) {
  if (validation.value.$invalid) return;
  emit('update:modelValue', { prefix, name });
}
</script>
