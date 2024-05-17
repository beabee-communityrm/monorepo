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
  >
    <template #format-switch-button>
      <font-awesome-icon :icon="faSort" />
    </template>
  </ColorPicker>
</template>

<script lang="ts" setup>
import { ColorPicker } from 'vue-accessible-color-picker';
import AppInput from './AppInput.vue';
import { ref, watch } from 'vue';
import useVuelidate from '@vuelidate/core';
import { faSort } from '@fortawesome/free-solid-svg-icons';

const emit = defineEmits(['update:modelValue']);
const props = defineProps<{
  id: string;
  modelValue: string;
}>();

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
