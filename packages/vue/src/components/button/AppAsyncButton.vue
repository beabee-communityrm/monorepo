<!-- AppAsyncButton: async operations with loading state and error notifications -->
<template>
  <AppButton
    v-bind="forwardedButtonProps"
    :loading="isLoading"
    :disabled="isLoading || props.disabled"
    :aria-busy="isLoading"
    @click="handleClick"
  >
    <span v-if="isLoading" class="sr-only">{{ t('common.loading') }}</span>
    <span :class="{ invisible: isLoading }">
      <slot />
    </span>
  </AppButton>
</template>

<script lang="ts" setup>
/**
 * Button that runs an async action on click, shows loading state, and reports errors via notifications.
 * Forwards all AppButton props except the async handler; overrides loading and disabled from local state.
 *
 * @component AppAsyncButton
 * @example
 * <AppAsyncButton :onClick="async () => await save()">Save</AppAsyncButton>
 */
import { addNotification } from '@beabee/vue/store/notifications';

import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AppButton, { type AppButtonProps } from './AppButton.vue';

const { t } = useI18n();

export interface AppAsyncButtonProps extends AppButtonProps {
  /** Async handler called on click; errors trigger an error notification */
  onClick?: (evt: Event) => Promise<void>;
}

const props = withDefaults(defineProps<AppAsyncButtonProps>(), {
  onClick: undefined,
});

/** Props passed to AppButton; excludes onClick which is handled internally */
const forwardedButtonProps = computed(() => {
  const { onClick: _onClick, ...rest } = props;
  return rest;
});

const isLoading = ref(false);

async function handleClick(evt: Event) {
  if (isLoading.value || props.disabled) return;

  isLoading.value = true;
  try {
    await props.onClick?.(evt);
  } catch (error: unknown) {
    const description =
      error instanceof Error
        ? error.message
        : t('form.errorMessages.asyncActionFailed');
    addNotification({
      title: t('form.errorMessages.generic'),
      variant: 'error',
      description,
    });
  } finally {
    isLoading.value = false;
  }
}
</script>
