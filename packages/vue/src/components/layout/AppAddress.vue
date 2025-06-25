<template>
  <div class="mb-3">
    <AppInput
      :model-value="line1"
      :label="labels.addressLine1"
      name="addressLine1"
      :required="required"
      @update:model-value="$emit('update:line1', $event)"
    />
  </div>

  <div class="mb-3">
    <AppInput
      :model-value="line2"
      :label="labels.addressLine2"
      @update:model-value="$emit('update:line2', $event)"
    />
  </div>

  <div class="grid grid-cols-6 gap-4">
    <div class="col-span-4 mb-3">
      <AppInput
        :model-value="cityOrTown"
        :label="labels.cityOrTown"
        name="cityOrTown"
        :required="required"
        @update:model-value="$emit('update:cityOrTown', $event)"
      />
    </div>

    <div class="col-span-2 mb-3">
      <AppInput
        :model-value="postCode"
        :label="labels.postCode"
        name="postCode"
        :required="required"
        @update:model-value="$emit('update:postCode', $event)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AppInput } from '../form';

/**
 * Address input component with structured address fields
 *
 * @example
 * ```vue
 * <AppAddress
 *   v-model:line1="address.line1"
 *   v-model:line2="address.line2"
 *   v-model:city-or-town="address.city"
 *   v-model:post-code="address.postCode"
 *   :labels="{
 *     addressLine1: 'Address Line 1',
 *     addressLine2: 'Address Line 2',
 *     cityOrTown: 'City',
 *     postCode: 'Post Code'
 *   }"
 *   :required="true"
 * />
 * ```
 */

export interface AddressLabels {
  /** Label for address line 1 field */
  addressLine1: string;
  /** Label for address line 2 field */
  addressLine2: string;
  /** Label for city/town field */
  cityOrTown: string;
  /** Label for post code field */
  postCode: string;
}

defineProps<{
  /** First line of address */
  line1: string;
  /** Second line of address (optional) */
  line2: string | undefined;
  /** City or town */
  cityOrTown: string;
  /** Post/zip code */
  postCode: string;
  /** Whether fields are required */
  required?: boolean;
  /** Labels for the form fields */
  labels: AddressLabels;
}>();

defineEmits<{
  (e: 'update:line1', value: string): void;
  (e: 'update:line2', value: string): void;
  (e: 'update:cityOrTown', value: string): void;
  (e: 'update:postCode', value: string): void;
}>();
</script>
