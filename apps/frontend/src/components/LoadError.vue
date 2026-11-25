<!--
  # LoadError
  The line a block shows in place of its content when it couldn't be loaded,
  pointing to the organisation's support email. Given a `retry`, it adds a
  button to try loading it again. While the retry runs the button shows a
  spinner. If it works, focus moves to the heading of the card it sits in, or
  else the page title, as the button is gone, unless the retry has already
  placed it; if it fails, a toast says so. The line and button follow the
  caller's text alignment.
-->
<template>
  <div ref="root" class="space-y-3">
    <i18n-t :keypath="keypath" tag="p" class="text-muted">
      <template #support>
        <a
          :href="`mailto:${generalContent.supportEmail}`"
          class="text-primary underline"
        >
          {{ generalContent.supportEmail }}
        </a>
      </template>
    </i18n-t>

    <UButton
      v-if="retry"
      color="neutral"
      variant="outline"
      :icon="retrying ? 'i-lucide-loader-circle' : 'i-lucide-rotate-cw'"
      :ui="{ leadingIcon: retrying ? 'animate-spin' : '' }"
      :aria-busy="retrying || undefined"
      class="min-h-11"
      @click="onRetry"
    >
      {{ t('actions.tryAgain') }}
    </UButton>
  </div>
</template>

<script lang="ts" setup>
import { useToast } from '@nuxt/ui/composables';

import { nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { generalContent } from '#store';

const props = withDefaults(
  defineProps<{
    /** Loads the content again; rejects if it still can't be loaded */
    retry?: () => Promise<unknown>;
    /** Locale key for the line, with a `{support}` placeholder */
    keypath?: string;
  }>(),
  { retry: undefined, keypath: 'homePage.loadError' }
);

const { t } = useI18n();
const toast = useToast();

const root = ref<HTMLElement>();
const retrying = ref(false);

async function focusHeadingOf(card: Element | null | undefined) {
  await nextTick();
  if (document.activeElement && document.activeElement !== document.body) {
    return;
  }
  const heading =
    card?.querySelector<HTMLElement>('[data-slot="header"] :is(h2, h3, h4)') ??
    document.querySelector<HTMLElement>('h1');
  if (!heading) return;
  heading.tabIndex = -1;
  heading.focus();
}

async function onRetry() {
  if (!props.retry || retrying.value) return;
  retrying.value = true;
  const card = root.value?.closest('[data-slot="root"]');
  try {
    await props.retry();
    await focusHeadingOf(card);
  } catch {
    toast.add({
      title: t('common.retryError'),
      color: 'error',
      icon: 'i-lucide-circle-alert',
    });
  } finally {
    retrying.value = false;
  }
}
</script>
