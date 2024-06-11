<!-- eslint-disable vue/no-mutating-props -->
<template>
  <AppSelect
    v-model="modelValue.type"
    :label="t('contacts.data.contributionType')"
    :items="contributionTypes"
    class="mb-3"
  />

  <template v-if="modelValue.type === ContributionType.Manual">
    <div class="mb-3">
      <AppInput
        v-model="modelValue.amount"
        :label="t('contacts.data.amount')"
        type="number"
        :prefix="generalContent.currencySymbol"
      />
    </div>

    <AppRadioGroup
      v-model="modelValue.period"
      name="period"
      :label="t('contacts.data.period')"
      :options="[
        ['monthly', t('common.contributionPeriod.monthly')],
        ['annually', t('common.contributionPeriod.annually')],
      ]"
      class="mb-4"
    />

    <AppSelect
      v-model="modelValue.source"
      :label="t('contacts.data.paymentSource')"
      :items="manualPaymentSources"
      class="mb-3"
    />

    <div class="mb-3">
      <AppInput
        v-model="modelValue.reference"
        :label="t('contacts.data.paymentReference')"
      />
    </div>
  </template>
</template>

<script lang="ts" setup>
import { ContributionType } from '@beabee/beabee-common';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import AppInput from '../forms/AppInput.vue';
import AppSelect from '../forms/AppSelect.vue';
import AppRadioGroup from '../forms/AppRadioGroup.vue';
import { fetchContent } from '../../utils/api/content';
import { generalContent } from '../../store';
import { type UpdateContribution } from './contact.interface';
import { type SelectItem } from '../forms/form.interface';

const { t } = useI18n();

defineProps<{ modelValue: UpdateContribution }>();

const contributionTypes = computed(() => [
  {
    id: 'None',
    label: t('common.contributionType.none'),
  },
  {
    id: 'Manual',
    label: t('common.contributionType.manual'),
  },
]);

const manualPaymentSources = ref<SelectItem<string>[]>([]);

onBeforeMount(async () => {
  manualPaymentSources.value = [
    {
      id: '',
      label: '',
    },
    ...(await fetchContent('contacts')).manualPaymentSources.map((x) => {
      return { id: x, label: x };
    }),
  ];
});
</script>
