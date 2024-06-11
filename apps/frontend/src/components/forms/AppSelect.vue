<template>
  <div>
    <AppLabel v-if="label" :label="label" :required="required" />
    <VueMultiselect
      :model-value="props.items.find((i) => i.id === props.modelValue)"
      :disabled="disabled"
      :allow-empty="!required"
      :options="items"
      track-by="id"
      label="label"
      :searchable="searchable"
      :show-labels="false"
      :show-pointer="false"
      :placeholder="placeholder"
      @update:model-value="emit('update:modelValue', $event.id)"
    />
    <AppInputError v-if="hasError" :message="validation.$errors[0].$message" />
    <AppInputHelp v-if="infoMessage" :message="infoMessage" />
  </div>
</template>

<script lang="ts" setup generic="T extends string | number">
import useVuelidate from '@vuelidate/core';
import { requiredIf } from '@vuelidate/validators';
import { computed } from 'vue';
import VueMultiselect from 'vue-multiselect';
import AppLabel from './AppLabel.vue';
import type { SelectItem } from './form.interface';
import AppInputError from './AppInputError.vue';
import AppInputHelp from './AppInputHelp.vue';
import { toRef } from 'vue';

const emit = defineEmits<(e: 'update:modelValue', value: T) => void>();
const props = defineProps<{
  label?: string;
  modelValue?: T;
  items: SelectItem<T>[];
  searchable?: boolean;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  // inputClass?: string;
  infoMessage?: string;
}>();

const rules = computed(() => ({
  v: { required: requiredIf(!!props.required) },
}));

const validation = useVuelidate(rules, { v: toRef(props, 'modelValue') });
const hasError = computed(() => validation.value.$errors.length > 0);
</script>
