<template>
  <div>
    <AppLabel v-if="label" :label="label" :required="required" />
    <label
      v-for="[value, optLabel] in options"
      :key="value.toString()"
      class="items-baseline"
      :class="inline ? 'mr-3 inline-flex align-top' : 'mb-1 flex'"
    >
      <input
        v-model="selected"
        type="radio"
        :name="name"
        :value="value"
        :checked="modelValue === value"
        class="mr-1.5"
        :required="required"
      />
      {{ optLabel }}
    </label>
  </div>
</template>

<script lang="ts" setup>
import useVuelidate from '@vuelidate/core';
import { requiredIf } from '@vuelidate/validators';
import { computed } from 'vue';
import AppLabel from './AppLabel.vue';

const emit = defineEmits(['update:modelValue']);

const props = defineProps<{
  modelValue?: string | boolean | number | null;
  options: [string | boolean | number, string][];
  name?: string;
  label?: string;
  inline?: boolean;
  required?: boolean;
}>();

const selected = computed({
  get: () => props.modelValue,
  set: (newValue) => emit('update:modelValue', newValue),
});

// Use a random name to group the inputs if no name provider
const uniqueName = Math.random().toString(16).substring(2);
const name = computed(() => props.name || uniqueName);

const isRequired = computed(() => !!props.required);
useVuelidate({ v: { required: requiredIf(isRequired) } }, { v: selected });
</script>
