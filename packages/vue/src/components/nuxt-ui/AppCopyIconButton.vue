<!--
  # AppCopyIconButton
  An icon-only copy-to-clipboard button (`UButton` + `UTooltip`), for use
  inside Nuxt UI inputs/fields. Swaps to a checkmark and `success` colour for
  1.5s after a successful copy, and shows an error notification if the
  clipboard write fails.

  ## Props
  - `text` (string): the text to copy to clipboard.
-->
<template>
  <UTooltip :text="t('actions.copy')" :content="{ side: 'right' }">
    <UButton
      :color="copied ? 'success' : 'neutral'"
      variant="link"
      size="xs"
      :icon="copied ? 'i-lucide-copy-check' : 'i-lucide-copy'"
      :aria-label="t('actions.copy')"
      @click="copy"
    />
  </UTooltip>
</template>

<script lang="ts" setup>
/**
 * Icon-only copy-to-clipboard button with checkmark feedback, for use
 * inside Nuxt UI inputs/fields.
 *
 * @component AppCopyIconButton
 */
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { addNotification } from '../../store/notifications';

export interface AppCopyIconButtonProps {
  /** The text to copy to clipboard */
  text: string;
}

const props = defineProps<AppCopyIconButtonProps>();

const { t } = useI18n();

/** Shows a checkmark for 1.5s after a successful copy */
const copied = ref(false);
let copiedTimeout: ReturnType<typeof setTimeout> | undefined;

async function copy() {
  try {
    await navigator.clipboard.writeText(props.text);
  } catch (error) {
    addNotification({ title: t('notifications.error'), variant: 'error' });
    return;
  }

  copied.value = true;
  clearTimeout(copiedTimeout);
  copiedTimeout = setTimeout(() => {
    copied.value = false;
  }, 1500);
}
</script>
