<template>
  <UPopover
    :content="{
      side: 'bottom',
      align: 'end',
      onOpenAutoFocus: (e: Event) => e.preventDefault(),
    }"
  >
    <UButton
      class="w-full @xl:w-auto"
      color="neutral"
      variant="outline"
      icon="i-lucide-share-2"
    >
      {{ t('actions.share') }}
    </UButton>

    <template #content>
      <div class="flex w-[340px] flex-col gap-3 p-4">
        <div class="flex flex-col gap-1.5">
          <span class="font-medium">
            {{ t('callout.share.address') }}
          </span>
          <UInput :model-value="url" readonly class="w-full">
            <template #trailing>
              <AppCopyIconButton :text="url" />
            </template>
          </UInput>
        </div>

        <USeparator />

        <div class="flex flex-col gap-2">
          <p class="text-muted">{{ t('callout.share.services') }}</p>
          <div class="grid grid-cols-2 gap-2">
            <UButton
              v-for="service in services"
              :key="service.name"
              :href="service.href"
              target="_blank"
              rel="nofollow noopener"
              color="neutral"
              variant="outline"
              :ui="{ base: 'justify-start' }"
              :aria-label="t(service.ariaKey)"
            >
              <template #leading>
                <UIcon
                  :name="service.icon"
                  class="size-4 shrink-0"
                  :style="{ color: service.color }"
                />
              </template>
              {{ service.name }}
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </UPopover>
</template>

<script lang="ts" setup>
import { AppCopyIconButton } from '@beabee/vue';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

/** Props for CalloutSharePopover */
export interface CalloutSharePopoverProps {
  /** The full URL to share */
  url: string;
}

const props = defineProps<CalloutSharePopoverProps>();

const services = computed(() => [
  {
    name: 'Facebook',
    icon: 'simple-icons:facebook',
    color: '#1877f2',
    ariaKey: 'callout.share.aria.facebook',
    href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(props.url)}`,
  },
  {
    name: 'LinkedIn',
    icon: 'simple-icons:linkedin',
    color: '#0a66c2',
    ariaKey: 'callout.share.aria.linkedin',
    href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(props.url)}`,
  },
  {
    name: 'Telegram',
    icon: 'simple-icons:telegram',
    color: '#229ed9',
    ariaKey: 'callout.share.aria.telegram',
    href: `https://telegram.me/share/url?url=${encodeURIComponent(props.url)}`,
  },
  {
    name: 'Twitter',
    icon: 'simple-icons:x',
    color: '#111827',
    ariaKey: 'callout.share.aria.twitter',
    href: `https://twitter.com/share?url=${encodeURIComponent(props.url)}`,
  },
  {
    name: 'WhatsApp',
    icon: 'simple-icons:whatsapp',
    color: '#25d366',
    ariaKey: 'callout.share.aria.whatsapp',
    href: `https://api.whatsapp.com/send?text=${encodeURIComponent(props.url)}`,
  },
  {
    name: t('form.email'),
    icon: 'i-lucide-mail',
    color: undefined,
    ariaKey: 'callout.share.aria.email',
    href: `mailto:?body=${encodeURIComponent(props.url)}`,
  },
]);
</script>
