<!--
  # AppWelcomeCard
  Greets a new member straight after they join, with the intro message set in
  the membership builder. Also used as that message's preview.

  ## Props
  - `firstName` (string): The member's first name.
  - `text` (string): Intro message HTML.
  - `level` (2 | 3 | 4 | 5 | 6, optional): Heading level for the title.
    Defaults to 3.
  - `dismissible` (boolean, optional): Shows a close button. Defaults to true.

  ## Events
  - `close`: The close button was clicked.
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
/**
 * Welcome card for a new member, showing the membership builder's intro
 * message.
 *
 * @component AppWelcomeCard
 */
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

export interface AppWelcomeCardProps {
  /** The member's first name */
  firstName: string;
  /** Intro message HTML */
  text: string;
  /** Heading level for the title, so the page's outline stays nested */
  level?: 2 | 3 | 4 | 5 | 6;
  /** Shows a close button */
  dismissible?: boolean;
}

withDefaults(defineProps<AppWelcomeCardProps>(), {
  level: 3,
  dismissible: true,
});

const emit = defineEmits<{ close: [] }>();
</script>
