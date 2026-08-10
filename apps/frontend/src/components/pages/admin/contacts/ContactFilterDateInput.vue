<!--
  # ContactFilterDateInput
  Date value input for a contact filter rule.

  The leading button switches between an absolute date and a relative
  expression such as `$now(d:-1)`, which the API resolves at query time.
-->
<template>
  <UButtonGroup>
    <UButton
      color="neutral"
      variant="subtle"
      :icon="isRelative ? 'i-lucide-circle-arrow-right' : 'i-lucide-circle-dot'"
      :aria-label="t('advancedSearch.relativeDate-nuxt')"
      :aria-pressed="isRelative"
      @click="isRelative = !isRelative"
    />
    <UInput
      v-if="isRelative"
      v-model="relativeValue"
      variant="subtle"
      placeholder="$now(d:-1)"
      class="w-40"
    />
    <UInput v-else v-model="dateValue" type="date" variant="subtle" />
  </UButtonGroup>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const modelValue = defineModel<string>({ required: true });

const isRelative = ref(modelValue.value.startsWith('$now'));

const relativeValue = ref(isRelative.value ? modelValue.value : '');
const dateValue = ref(isRelative.value ? '' : modelValue.value);

const currentValue = computed(() =>
  isRelative.value ? relativeValue.value : dateValue.value
);

watch(currentValue, (value) => (modelValue.value = value));
</script>
