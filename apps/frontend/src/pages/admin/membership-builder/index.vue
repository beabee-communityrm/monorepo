<route lang="yaml">
name: adminMembershipBuilderJoinForm
meta:
  pageTitle: membershipBuilder.title
  role: admin
</route>

<template>
  <App2ColGrid class="mb-8">
    <template #col1>
      <p>{{ stepT('text') }}</p>
    </template>
  </App2ColGrid>
  <App2ColGrid v-if="joinContent" extended>
    <template #col1>
      <AppForm
        :button-text="t('form.saveChanges')"
        :success-text="t('form.saved')"
        @submit="handleUpdate"
      >
        <div class="mb-4">
          <AppInput
            v-model="joinContent.title"
            :label="stepT('formTitle')"
            required
          />
        </div>
        <RichTextEditor
          v-model="joinContent.subtitle"
          :label="stepT('formSubtitle')"
          class="mb-4"
        />

        <AppImageUpload
          v-model="validation.backgroundUrl.$model"
          :label="stepT('backgroundImage')"
          :width="1440"
          :height="810"
          class="mb-4"
          required
          :error-message="validation.backgroundUrl.$errors[0]?.$message"
        />

        <AppSubHeading> {{ stepT('suggestedAmounts') }} * </AppSubHeading>
        <div class="mb-4 flex gap-4">
          <PeriodAmounts
            v-for="(period, periodI) in joinContent.periods"
            :key="period.name"
            v-model="joinContent.periods[periodI].presetAmounts"
            :period="period.name"
            :min-monthly-amount="joinContent.minMonthlyAmount"
            class="flex-1"
          />
        </div>

        <div class="mb-4 flex gap-4">
          <div class="flex-1">
            <AppLabel :label="stepT('minAmount')" />
            <div class="max-w-[12rem]">
              <AppInput
                v-model="joinContent.minMonthlyAmount"
                type="number"
                :min="1"
                :prefix="generalContent.currencySymbol"
                :suffix="t('common.perMonth')"
                required
                class="block w-32"
              />
            </div>
          </div>
          <div class="flex-1">
            <AppSelect
              v-model="selectedDefaultAmount"
              :label="stepT('defaultAmount')"
              :items="defaultAmounts"
              required
            />
          </div>
        </div>
        <AppCheckbox
          v-model="joinContent.showNoContribution"
          :label="stepT('showNoContribution')"
          class="mb-4 font-semibold"
        />
        <AppCheckbox
          v-model="joinContent.showAbsorbFee"
          :label="stepT('showAbsorbFee')"
          class="mb-4 font-semibold"
        />
      </AppForm>
    </template>
    <template #col2>
      <JoinForm
        :join-content="joinContent"
        :payment-content="paymentContent!"
        preview
      />
    </template>
  </App2ColGrid>
</template>
<script lang="ts" setup>
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { ContributionPeriod } from '@beabee/beabee-common';

import AppForm from '@components/forms/AppForm.vue';
import AppInput from '@components/forms/AppInput.vue';
import RichTextEditor from '@components/rte/RichTextEditor.vue';
import AppLabel from '@components/forms/AppLabel.vue';
import AppSelect from '@components/forms/AppSelect.vue';
import AppCheckbox from '@components/forms/AppCheckbox.vue';
import JoinForm from '@components/pages/join/JoinForm.vue';
import AppImageUpload from '@components/forms/AppImageUpload.vue';
import PeriodAmounts from '@components/pages/admin/membership-builder/PeriodAmounts.vue';
import App2ColGrid from '@components/App2ColGrid.vue';
import AppSubHeading from '@components/AppSubHeading.vue';

import { fetchContent, updateContent } from '@utils/api/content';

import { generalContent } from '@store';

import type { ContentJoinData, ContentPaymentData } from '@type';

const joinContent = ref<ContentJoinData>();
const paymentContent = ref<ContentPaymentData>();
const backgroundUrl = ref('');

const { n, t } = useI18n();

const stepT = (key: string) => t('membershipBuilder.steps.joinForm.' + key);

const selectedDefaultAmount = computed({
  get: () =>
    joinContent.value
      ? `${joinContent.value.initialPeriod}_${joinContent.value.initialAmount}`
      : '',
  set: (defaultAmount) => {
    if (joinContent.value) {
      const [periodName, amount] = defaultAmount.split('_');
      joinContent.value.initialPeriod = periodName as ContributionPeriod;
      joinContent.value.initialAmount = Number(amount);
    }
  },
});

const defaultAmounts = computed(() => {
  return joinContent.value
    ? joinContent.value.periods.flatMap((period) =>
        period.presetAmounts.map((amount) => ({
          id: `${period.name}_${amount}`,
          label: `${n(amount, 'currency')} ${
            period.name === ContributionPeriod.Monthly
              ? t('common.perMonth')
              : t('common.perYear')
          }`,
        }))
      )
    : [];
});

const validation = useVuelidate(
  {
    backgroundUrl: { required },
  },
  { backgroundUrl }
);

async function handleUpdate() {
  if (joinContent.value) {
    await Promise.all([
      updateContent('join', joinContent.value),
      updateContent('general', {
        backgroundUrl: backgroundUrl.value || '',
      }),
    ]);
  }
}

onBeforeMount(async () => {
  joinContent.value = await fetchContent('join');
  paymentContent.value = await fetchContent('payment');
  backgroundUrl.value = generalContent.value.backgroundUrl || '';
});
</script>
