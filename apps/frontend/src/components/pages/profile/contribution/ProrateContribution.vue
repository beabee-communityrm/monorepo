<template>
  <div v-if="oneOffPayment < 0" class="mb-5">
    <p class="mb-3">
      {{ t('contribution.prorateDecreaseMessage', monthsLeft) }}
      {{
        t('contribution.prorateDecreaseMessageWillStart', {
          renewalDate: formattedRenewalDate,
        })
      }}
    </p>
  </div>
  <div v-if="aboveThreshold" class="mb-5">
    <p class="mb-3">
      {{ t('contribution.prorateIncreaseMessage', monthsLeft) }}
      {{
        t('contribution.prorateIncreaseMessageOneOff', {
          oneOffPayment: n(oneOffPayment, 'currency'),
        })
      }}
    </p>
    <label class="mb-2 flex">
      <div class="mr-1 flex-none">
        <input v-model="prorate" type="radio" :value="true" />
      </div>
      <div class="flex-auto">
        <h4 class="font-semibold">{{ t('contribution.prorateYesTitle') }}</h4>
        <p class="text-sm">
          {{
            t('contribution.prorateYesText', {
              oneOffPayment: n(oneOffPayment, 'currency'),
            })
          }}
        </p>
      </div>
    </label>
    <label class="mb-2 flex">
      <div class="mr-1 flex-none">
        <input v-model="prorate" type="radio" :value="false" />
      </div>
      <div class="flex-auto">
        <h4 class="font-semibold">
          {{
            t('contribution.prorateNoTitle', {
              renewalDate: formattedRenewalDate,
            })
          }}
        </h4>
        <p class="text-sm">
          {{ t('contribution.prorateNoText') }}
        </p>
      </div>
    </label>
  </div>
</template>

<script lang="ts" setup>
import { differenceInMonths } from 'date-fns';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatLocale } from '../../../../utils/dates';

const { t, n } = useI18n();

const emit = defineEmits(['update:modelValue']);
const props = defineProps<{
  modelValue: boolean;
  newAmount: number;
  oldAmount: number;
  renewalDate: Date;
}>();

const prorate = ref(props.modelValue);

const monthsLeft = computed(() =>
  Math.max(0, differenceInMonths(props.renewalDate, new Date()))
);

const oneOffPayment = computed(
  () =>
    Math.floor(
      (((props.newAmount - props.oldAmount) * monthsLeft.value) / 12) * 100
    ) / 100
);

const aboveThreshold = computed(() => oneOffPayment.value >= 1);

watch(
  [prorate, aboveThreshold],
  ([newProrate, newAboveThreshold]) =>
    emit('update:modelValue', newProrate && newAboveThreshold),
  { immediate: true }
);

// TODO: formatLocale isn't imported if used directly in the template
const formattedRenewalDate = computed(() =>
  formatLocale(props.renewalDate, 'PPP')
);
</script>
