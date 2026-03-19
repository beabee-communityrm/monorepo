<template>
  <div class="mb-4">
    <AppCheckbox v-model="enabled" :label="label" class="font-bold" />
  </div>
  <div v-if="enabled" class="mb-4 max-w-[8rem] whitespace-nowrap">
    <AppInput
      v-model="taxRate"
      type="number"
      :label="t('adminSettings.payment.taxRate')"
      :min="0"
      :max="100"
      suffix="%"
      required
    />
  </div>
</template>

<script lang="ts" setup>
import { AppCheckbox, AppInput } from '@beabee/vue';

import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineProps<{ label: string }>();

const model = defineModel<number | null>({ default: null });

// last non-null value to restore when re-enabled
const draft = ref(0);

const taxRate = computed({
  get: () => model.value ?? draft.value,
  set(v) {
    draft.value = v;
    if (enabled.value) model.value = v;
  },
});

const enabled = computed({
  get: () => model.value !== null,
  set(on) {
    model.value = on ? draft.value : null;
  },
});

watch(
  model,
  (mv) => {
    if (mv !== null) draft.value = mv;
  },
  { immediate: true }
);
</script>
