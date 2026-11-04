<!--
  # ContactFilterDateInput
  Date value input for a contact filter rule.

  The leading button switches between an absolute date and a relative
  expression such as `$now(d:-1)`, which the API resolves at query time.
-->
<template>
  <div class="flex items-center gap-2">
    <UTooltip :text="t('advancedSearch.relativeDateExample-nuxt', { example })">
      <UButton
        color="neutral"
        variant="subtle"
        :icon="
          isRelative ? 'i-lucide-circle-arrow-right' : 'i-lucide-circle-dot'
        "
        :aria-label="t('advancedSearch.relativeDate-nuxt')"
        :aria-pressed="isRelative"
        @click="isRelative = !isRelative"
      />
    </UTooltip>
    <template v-if="isRelative">
      <UInput
        v-model="relativeValue"
        variant="subtle"
        :placeholder="example"
        class="w-40 font-mono"
        :aria-invalid="!!relativeValue && !preview"
        :aria-describedby="previewId"
        :aria-label="label"
      />
      <span v-if="relativeValue" :id="previewId" class="text-muted">
        {{ preview || t('advancedSearch.relativeDateInvalid-nuxt') }}
      </span>
    </template>
    <UInput
      v-else
      v-model="dateValue"
      type="date"
      variant="subtle"
      :aria-label="label"
    />
  </div>
</template>

<script lang="ts" setup>
import { isValidDate, parseDate } from '@beabee/beabee-common';
import { formatLocale } from '@beabee/vue';

import { computed, ref, useId, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

defineProps<{
  /** Accessible name for the input, usually the field being filtered */
  label: string;
}>();

const modelValue = defineModel<string>({ required: true });

const example = '$now(d:-1)';
const previewId = useId();

const isRelative = ref(modelValue.value.startsWith('$now'));

const relativeValue = ref(isRelative.value ? modelValue.value : '');
const dateValue = ref(isRelative.value ? '' : modelValue.value);

const preview = computed(() =>
  isValidDate(relativeValue.value)
    ? formatLocale(parseDate(relativeValue.value)[0], 'PPP')
    : ''
);

const currentValue = computed(() =>
  isRelative.value ? relativeValue.value : dateValue.value
);

watch(currentValue, (value) => (modelValue.value = value));
</script>
