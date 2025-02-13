<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div>
    <AppFormSection>
      <AppLabel :label="inputT('starts.label')" required />
      <AppRadioGroup
        v-if="canStartNow"
        v-model="data.startNow"
        name="calloutStartDate"
        :options="[
          [true, inputT('starts.opts.now')],
          [false, inputT('starts.opts.schedule')],
        ]"
        required
      />
      <div v-if="!data.startNow" class="flex gap-2">
        <div>
          <AppInput v-model="data.startDate" type="date" required />
        </div>
        <div>
          <AppInput v-model="data.startTime" type="time" required />
        </div>
      </div>
    </AppFormSection>
    <AppFormSection>
      <AppRadioGroup
        v-model="data.hasEndDate"
        name="calloutEndDate"
        :label="inputT('expires.label')"
        :options="[
          [false, inputT('expires.opts.never')],
          [true, inputT('expires.opts.schedule')],
        ]"
        required
      />
      <div v-if="data.hasEndDate" class="flex gap-2">
        <div>
          <AppInput v-model="data.endDate" type="date" required />
        </div>
        <div>
          <AppInput v-model="data.endTime" type="time" required />
        </div>
      </div>
    </AppFormSection>
  </div>
</template>

<script lang="ts" setup>
import { ItemStatus } from '@beabee/beabee-common';
import useVuelidate from '@vuelidate/core';
import { computed, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import AppInput from '../../../../forms/AppInput.vue';
import AppLabel from '../../../../forms/AppLabel.vue';
import AppRadioGroup from '../../../../forms/AppRadioGroup.vue';
import AppFormSection from '../../../../forms/AppFormSection.vue';
import type { DateAndDurationStepProps } from '../callouts.interface';
import { sameAs } from '@vuelidate/validators';

const emit = defineEmits(['update:error', 'update:validated']);
const props = defineProps<{
  data: DateAndDurationStepProps;
  status: ItemStatus | undefined;
  isActive: boolean;
}>();

const { t } = useI18n();
const inputT = (key: string) => t('createCallout.steps.dates.inputs.' + key);

// Force step to stay unvalidated until it is visited for new callouts
const hasVisited = ref(!!props.status);
watch(toRef(props, 'isActive'), (active) => (hasVisited.value ||= active));
const validation = useVuelidate(
  { v: { yes: sameAs(true) } },
  { v: hasVisited }
);

const canStartNow = computed(
  () =>
    !props.status ||
    props.status === ItemStatus.Draft ||
    props.status === ItemStatus.Scheduled
);

watch(
  validation,
  () => {
    emit('update:error', validation.value.$errors.length > 0);
    emit('update:validated', !validation.value.$invalid);
  },
  { immediate: true }
);
</script>
