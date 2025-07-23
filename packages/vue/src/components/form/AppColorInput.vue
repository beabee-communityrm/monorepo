<!--
  # AppColorInput
  A color picker component combining text input for hex values with an interactive color picker widget.
  Supports both 3-digit (#RGB) and 6-digit (#RRGGBB) hex formats with validation.
-->
<template>
  <div class="mb-2 flex">
    <div
      class="flex-0 mr-2 mt-1.5 h-7 w-7 rounded-full"
      :style="{ backgroundColor: modelValue }"
    />
    <div class="flex-1">
      <AppInput
        v-model="colorText"
        name="color"
        pattern="#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})"
        required
      />
    </div>
  </div>
  <ColorPicker
    :id="id"
    alpha-channel="hide"
    :color="modelValue"
    @color-change="changeColor($event.colors.hex)"
    :class="rightAligned ? 'ml-8' : ''"
  >
    <template #format-switch-button>
      <font-awesome-icon :icon="faSort" />
    </template>
  </ColorPicker>
</template>

<script lang="ts" setup>
import { faSort } from '@fortawesome/free-solid-svg-icons';
import useVuelidate from '@vuelidate/core';
import { ref, watch } from 'vue';
import { ColorPicker } from 'vue-accessible-color-picker';

import AppInput from './AppInput.vue';

export interface AppColorInputProps {
  /** The id of the color input */
  id: string;
  /** The model value of the color input */
  modelValue: string;
  /** The name of the color input */
  rightAligned?: boolean;
}

const emit = defineEmits(['update:modelValue']);
const props = defineProps<AppColorInputProps>();

const validation = useVuelidate();
const colorText = ref(props.modelValue);

function changeColor(newColor: string) {
  colorText.value = newColor.substring(0, newColor.length === 5 ? 4 : 7); // Ignore alpha
}

watch(
  colorText,
  (newColor) => {
    if (!validation.value.$invalid) {
      emit('update:modelValue', newColor);
    }
  },
  { flush: 'post' }
);
</script>

<style lang="postcss">
@import url('vue-accessible-color-picker/styles');
:root {
  --vacp-color-background: transparent;
  --vacp-font-family: inherit;
}
/* This needs more specificity to apply on production builds */
.vacp-color-picker.vacp-color-picker {
  .vacp-copy-button,
  .vacp-color-inputs {
    display: none;
  }
}
</style>
