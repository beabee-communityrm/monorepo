<!--
  # WelcomeCard
  Greets a new member on the home page straight after they join, with the
  intro message set in the membership builder. The membership builder uses it
  for its preview too, with `dismissible` off.
-->
<template>
  <UCard
    :ui="{
      body: [
        'relative flex flex-wrap items-center gap-3',
        dismissible && 'pr-14 sm:pr-14',
      ],
    }"
  >
    <div
      class="flex size-14 shrink-0 items-center justify-center rounded-lg bg-cream"
    >
      <UIcon
        name="i-lucide-newspaper"
        class="size-7 text-highlighted"
        aria-hidden="true"
      />
    </div>
    <div class="min-w-60 flex-1 space-y-1.5">
      <component :is="`h${level}`">
        {{ t('homePage.welcome', { firstName }) }}
      </component>
      <div class="nuxt-prose" v-html="text" />
    </div>
    <UButton
      v-if="dismissible"
      icon="i-lucide-x"
      color="neutral"
      variant="ghost"
      class="absolute top-3 right-3"
      :aria-label="t('actions.close')"
      @click="emit('close')"
    />
  </UCard>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

/** Props for WelcomeCard */
export interface WelcomeCardProps {
  /** The member's first name */
  firstName: string;
  /** Intro message HTML */
  text: string;
  /** Heading level for the title, so the page's outline stays nested */
  level?: 2 | 3 | 4 | 5 | 6;
  /** Shows a close button */
  dismissible?: boolean;
}

withDefaults(defineProps<WelcomeCardProps>(), {
  level: 3,
  dismissible: true,
});

const emit = defineEmits<{ close: [] }>();
</script>
