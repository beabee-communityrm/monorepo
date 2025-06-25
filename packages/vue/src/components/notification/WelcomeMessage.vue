<template>
  <section
    class="relative rounded bg-white p-4 shadow"
    :class="!small && 'lg:p-8'"
    role="complementary"
    :aria-labelledby="headingId"
  >
    <div>
      <WelcomeIcon
        class="float-left mb-4 mr-4 h-auto w-[4.5rem] md:w-[7.5rem]"
        :class="!small && 'lg:mb-8 lg:mr-8 lg:w-[17rem]'"
        :aria-label="iconAriaLabel"
      />

      <AppSubHeading :id="headingId">
        {{ welcomeText }}
      </AppSubHeading>
    </div>

    <div
      class="content-message whitespace-normal text-sm leading-5 md:text-base md:leading-5.5"
      :class="!small && 'lg:leading-6'"
      v-html="text"
    />

    <div class="clear-left" />

    <button
      class="absolute right-4 top-4 cursor-pointer rounded text-2xl hover:text-body-60 focus:outline-none focus:ring-2 focus:ring-primary-40 focus:ring-offset-2"
      :aria-label="closeAriaLabel"
      @click="$emit('close')"
    >
      <font-awesome-icon :icon="faTimes" />
    </button>
  </section>
</template>

<script lang="ts" setup>
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { computed } from 'vue';

import { AppSubHeading } from '../typography';
import WelcomeIcon from './WelcomeIcon.vue';

/**
 * WelcomeMessage displays a personalized welcome message with user information
 * and a closeable interface for onboarding or informational content.
 */

export interface WelcomeMessageProps {
  /** User's first name for personalization */
  firstName: string;
  /** User's last name for personalization */
  lastName: string;
  /** HTML content of the welcome message */
  text: string;
  /** Template for the welcome greeting with firstName and lastName placeholders */
  welcomeTemplate: string;
  /** Whether to display in small/compact mode */
  small?: boolean;
  /** Accessibility label for the welcome icon */
  iconAriaLabel?: string;
  /** Accessibility label for the close button */
  closeAriaLabel?: string;
}

const props = withDefaults(defineProps<WelcomeMessageProps>(), {
  small: false,
  iconAriaLabel: 'Welcome icon',
  closeAriaLabel: 'Close welcome message',
});

const welcomeText = computed(() => {
  return props.welcomeTemplate
    .replace('{firstName}', props.firstName)
    .replace('{lastName}', props.lastName);
});

const headingId = computed(
  () => `welcome-heading-${Math.random().toString(36).substr(2, 9)}`
);

defineEmits<{
  /** Emitted when the close button is clicked */
  (e: 'close'): void;
}>();
</script>
