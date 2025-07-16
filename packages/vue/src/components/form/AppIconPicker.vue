<!--
  # AppIconPicker
  A icon picker that allows users to select icons from a predefined set. 
-->

<template>
  <div style="margin-left: 8px">
    <div class="grid grid-cols-[auto_1fr] items-center gap-2">
      <font-awesome-icon
        :icon="[modelValue.prefix, modelValue.name]"
        style="font-size: 1.7rem"
      />
      <AppSearchInput v-model="iconSearchValue" :placeholder="'Search...'" />
    </div>
    <div class="mt-4 grid grid-cols-5 gap-4 pl-7">
      <div
        v-for="(icon, idx) in icons"
        :key="idx"
        class="items-centersss flex flex-col"
      >
        <AppButton
          size="xs"
          :variant="'dangerGhost'"
          @click="setIcon(props.style, icon.name)"
        >
          <font-awesome-icon :icon="[props.style, icon.name]" />
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type IconSchema } from '@beabee/beabee-common';
import { IconSearchService, formatIconForDisplay } from '@beabee/fontawesome';

import useVuelidate from '@vuelidate/core';
import { computed, ref, watch } from 'vue';

import AppButton from '../button/AppButton.vue';
import AppSearchInput from './AppSearchInput.vue';

export interface AppIconPickerProps {
  /** The id of the color input */
  id: string;
  /** The model value of the color input */
  modelValue: IconSchema;
  /** The  limit of icons to display */
  limit?: number;
  /** The styles of icons to display */
  style?: 'solid' | 'regular' | 'light' | 'duotone' | 'brands';
}

const emit = defineEmits(['update:modelValue']);

const props = withDefaults(defineProps<AppIconPickerProps>(), {
  limit: 25,
  style: 'solid' as 'solid' | 'regular' | 'light' | 'duotone' | 'brands',
});

const validation = useVuelidate();

const iconSearchValue = ref<string>('location');

const iconService = new IconSearchService();

const icons = computed(() => {
  return iconService
    .filterIcons({
      styles: [props.style],
      query: iconSearchValue.value,
      limit: props.limit,
    })
    .map((icon) => {
      return formatIconForDisplay(icon);
    });
});

const icon = ref(props.modelValue);

function setIcon(prefix: string, name: string) {
  icon.value = {
    prefix,
    name,
  };
  if (!validation.value.$invalid) {
    emit('update:modelValue', icon.value);
  }
}
</script>
