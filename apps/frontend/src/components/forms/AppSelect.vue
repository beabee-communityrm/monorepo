<template>
  <div>
    <AppLabel v-if="label" :label="label" :required="required" />
    <select
      v-model="value"
      class="w-full rounded border p-2 leading-tight focus:shadow-input focus:outline-none"
      :class="{
        [inputClass || '']: true,
        'cursor-not-allowed border-primary-20 bg-grey-lighter': disabled,
        'border-primary-40 bg-white': !disabled,
      }"
      :disabled="disabled"
      :required="required"
    >
      <template v-for="item in items">
        <optgroup v-if="isGroup(item)" :key="item.label" :label="item.label">
          <AppSelectItem
            v-for="groupItem in item.items"
            :key="groupItem.id"
            :item="groupItem"
            :selected="modelValue === groupItem.id"
            :disabled="groupItem.id === '' && required"
          />
        </optgroup>
        <AppSelectItem
          v-else
          :key="item.id"
          :item="item"
          :selected="modelValue === item.id"
          :disabled="item.id === '' && required"
        />
      </template>
    </select>
    <AppInputError v-if="hasError" :message="validation.$errors[0].$message" />
    <AppInputHelp v-if="infoMessage" :message="infoMessage" />
  </div>
</template>

<script lang="ts" setup>
import useVuelidate from '@vuelidate/core';
import { requiredIf } from '@vuelidate/validators';
import { computed } from 'vue';
import AppLabel from './AppLabel.vue';
import type { SelectGroup, SelectItem } from './form.interface';
import AppSelectItem from './AppSelectItem.vue';
import AppInputError from './AppInputError.vue';
import AppInputHelp from './AppInputHelp.vue';

function isGroup(item: SelectItem | SelectGroup): item is SelectGroup {
  return 'items' in item;
}

const emit = defineEmits(['update:modelValue']);
const props = defineProps<{
  label?: string;
  modelValue?: string | number | null;
  items: (SelectItem | SelectGroup)[];
  disabled?: boolean;
  required?: boolean;
  inputClass?: string;
  infoMessage?: string;
}>();

const value = computed({
  get: () => props.modelValue,
  set: (newValue) => emit('update:modelValue', newValue),
});

const isRequired = computed(() => !!props.required);

const validation = useVuelidate(
  { v: { required: requiredIf(isRequired) } },
  { v: value }
);
const hasError = computed(() => validation.value.$errors.length > 0);
</script>
