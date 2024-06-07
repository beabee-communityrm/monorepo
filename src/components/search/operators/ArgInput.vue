<template>
  <b v-if="readonly">{{ prefix }}{{ readonlyValue }}</b>
  <AppRadioGroup
    v-else-if="item.type === 'boolean'"
    v-model="value"
    :options="[
      [true, t('common.yes')],
      [false, t('common.no')],
    ]"
    inline
    required
  />
  <AppSelect
    v-else-if="item.type === 'enum' || (item.type === 'array' && item.options)"
    v-model="value"
    :items="item.options || []"
    required
  />
  <DateInput v-else-if="item.type === 'date'" v-model="value" />
  <AppInput
    v-else
    v-model="value"
    :type="
      item.type === 'contact' || item.type === 'array' || item.type === 'blob'
        ? 'text'
        : item.type
    "
    :prefix="prefix"
    required
    hide-error-message
    class="min-w-[10rem]"
  />
</template>
<script lang="ts" setup>
import type { RuleValue } from '@beabee/beabee-common';
import { computed } from 'vue';
import { formatLocale } from '../../../utils/dates';
import AppInput from '../../forms/AppInput.vue';
import AppRadioGroup from '../../forms/AppRadioGroup.vue';
import AppSelect from '../../forms/AppSelect.vue';
import DateInput from './DateInput.vue';
import { useI18n } from 'vue-i18n';
import type { FilterItem } from '@type';

const emit = defineEmits(['update:modelValue']);
const props = defineProps<{
  modelValue: RuleValue;
  item: FilterItem;
  readonly: boolean;
}>();

const { t } = useI18n();

const value = computed({
  // modelValue has a different type depending on the item.type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get: () => props.modelValue as any,
  set: (modelValue) => emit('update:modelValue', modelValue),
});

const prefix = computed(() =>
  'prefix' in props.item ? props.item.prefix : ''
);

const readonlyValue = computed(() => {
  switch (props.item.type) {
    case 'date': {
      const date = props.modelValue as string;
      if (date.startsWith('$now')) {
        return props.modelValue;
      } else {
        return formatLocale(new Date(date), 'P');
      }
    }
    case 'boolean':
      return props.modelValue === true ? t('common.yes') : t('common.no');

    case 'array':
    case 'enum':
      return (
        props.item.options?.find((opt) => opt.id === props.modelValue)?.label ||
        props.modelValue
      );

    default:
      return props.modelValue;
  }
});
</script>
