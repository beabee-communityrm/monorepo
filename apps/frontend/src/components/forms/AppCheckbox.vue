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

const emit = defineEmits(['update:modelValue']);
const props = defineProps<{
  modelValue?: boolean;
  disabled?: boolean;
  label?: string;
  icon?: IconDefinition;
  required?: boolean;
}>();

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
