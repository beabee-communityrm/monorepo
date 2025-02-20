<template>
  <label class="flex flex-row items-start font-semibold">
    <input
      v-model="value"
      type="checkbox"
      :disabled="disabled"
      :required="required"
      :value="true"
      class="mt-1"
    />
    <p v-if="label || icon" class="ml-2">
      <font-awesome-icon v-if="icon" :icon="icon" />
      {{ label }}
    </p>
  </label>
</template>
<script lang="ts" setup>
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import useVuelidate from '@vuelidate/core';
import { sameAs } from '@vuelidate/validators';
import { computed, ref, toRef, watch } from 'vue';

export interface AppCheckboxProps {
  /** The model value of the checkbox */
  modelValue?: boolean;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** The label of the checkbox */
  label?: string;
  /** The icon of the checkbox */
  icon?: IconDefinition;
  /** Whether the checkbox is required */
  required?: boolean;
}

const emit = defineEmits(['update:modelValue']);
const props = defineProps<AppCheckboxProps>();

const value = ref(false);
watch(value, () => emit('update:modelValue', value.value));
watch(toRef(props, 'modelValue'), (newValue) => (value.value = newValue), {
  immediate: true,
});

const rules = computed(() =>
  props.required ? { v: { ticked: sameAs(true) } } : { v: {} }
);

useVuelidate(rules, { v: value });
</script>
