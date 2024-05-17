<template>
  <section class="mb-8" :class="disabled && 'opacity-50'">
    <p class="mb-2 text-sm leading-normal">
      {{ t('join.absorbFeeText', { fee: n(fee, 'currency') }) }}
    </p>

    <AppCheckbox
      v-model="payFee"
      :disabled="force || disabled"
      :label="
        t(force ? 'join.absorbFeeForce' : 'join.absorbFeeOptIn', {
          fee: n(fee, 'currency'),
          amount: n(amount, 'currency'),
        })
      "
    />
  </section>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import AppCheckbox from '../forms/AppCheckbox.vue';

const { t, n } = useI18n();

const emit = defineEmits(['update:modelValue']);

const props = defineProps<{
  amount: number;
  fee: number;
  force: boolean;
  modelValue: boolean;
  disabled: boolean;
}>();

const payFee = computed<boolean>({
  get: () => !props.disabled && props.modelValue,
  set: (value) => emit('update:modelValue', value),
});
</script>
