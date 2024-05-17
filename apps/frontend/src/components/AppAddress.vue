<template>
  <div class="mb-3">
    <AppInput
      :model-value="line1"
      :label="t('form.addressLine1')"
      name="addressLine1"
      :required="required"
      @update:model-value="$emit('update:line1', $event)"
    />
  </div>

  <div class="mb-3">
    <AppInput
      :model-value="line2"
      :label="t('form.addressLine2')"
      @update:model-value="$emit('update:line2', $event)"
    />
  </div>

  <div class="grid grid-cols-6 gap-4">
    <div class="col-span-4 mb-3">
      <AppInput
        :model-value="cityOrTown"
        :label="t('form.cityOrTown')"
        name="cityOrTown"
        :required="required"
        @update:model-value="$emit('update:cityOrTown', $event)"
      />
    </div>

    <div class="col-span-2 mb-3">
      <AppInput
        :model-value="postCode"
        :label="t('form.postCode')"
        name="postCode"
        :required="required"
        @update:model-value="$emit('update:postCode', $event)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import AppInput from './forms/AppInput.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineProps<{
  line1: string;
  line2: string | undefined;
  cityOrTown: string;
  postCode: string;
  required?: boolean;
}>();

defineEmits([
  'update:line1',
  'update:line2',
  'update:cityOrTown',
  'update:postCode',
]);
</script>
