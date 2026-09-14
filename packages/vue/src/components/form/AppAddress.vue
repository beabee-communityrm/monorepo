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

  <div class="mb-3">
    <AppSelect
      :model-value="country"
      :label="t('form.country')"
      :items="countryItems"
      :placeholder="t('common.selectOne')"
      searchable
      :required="required"
      @update:model-value="$emit('update:country', $event)"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { getCountryItems } from '../../utils/countries';
import AppInput from './AppInput.vue';
import AppSelect from './AppSelect.vue';

const { t, locale } = useI18n();

const countryItems = computed(() => getCountryItems(locale.value));

/**
 * Address input component with structured address fields.
 * Now uses internal i18n with these translation keys:
 * - form.addressLine1: "Address line 1"
 * - form.addressLine2: "Address line 2"
 * - form.cityOrTown: "City/Town"
 * - form.postCode: "Postcode"
 * - form.country: "Country"
 *
 * @example
 * ```vue
 * <AppAddress
 *   v-model:line1="address.line1"
 *   v-model:line2="address.line2"
 *   v-model:city-or-town="address.city"
 *   v-model:post-code="address.postCode"
 *   v-model:country="address.country"
 *   :required="true"
 * />
 * ```
 */

defineProps<{
  /** First line of address */
  line1: string;
  /** Second line of address (optional) */
  line2: string | undefined;
  /** City or town */
  cityOrTown: string;
  /** Post/zip code */
  postCode: string;
  /** ISO 3166-1 alpha-2 country code */
  country: string | undefined;
  /** Whether fields are required */
  required?: boolean;
}>();

defineEmits<{
  (e: 'update:line1', value: string): void;
  (e: 'update:line2', value: string): void;
  (e: 'update:cityOrTown', value: string): void;
  (e: 'update:postCode', value: string): void;
  (e: 'update:country', value: string): void;
}>();
</script>
