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
      :aria-label="t('actions.close')"
      type="button"
      @click="$emit('close')"
    >
      <font-awesome-icon :icon="faTimes" />
    </button>
  </section>
</template>

<script lang="ts" setup>
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { generateUniqueId } from '../../utils';
import { AppSubHeading } from '../typography';
import WelcomeIcon from './WelcomeIcon.vue';

const { t } = useI18n();

/**
 * WelcomeMessage displays a personalized welcome message with user information
 * and a closeable interface for onboarding or informational content.
 *
 * Uses internal i18n for welcome text and accessibility labels:
 * - Welcome message: homePage.welcome with firstName/lastName interpolation
 * - Close button aria-label: actions.close
 * - WelcomeIcon manages its own aria-label internally
 */

export interface WelcomeMessageProps {
  /** User's first name for personalization */
  firstName: string;
  /** User's last name for personalization */
  lastName: string;
  /** HTML content of the welcome message */
  text: string;
  /** Whether to display in small/compact mode */
  small?: boolean;
}

const props = withDefaults(defineProps<WelcomeMessageProps>(), {
  small: false,
});

const welcomeText = computed(() => {
  return t('homePage.welcome', {
    firstName: props.firstName,
    lastName: props.lastName,
  });
});

const headingId = generateUniqueId('welcome-heading');

defineEmits<{
  /** Emitted when the close button is clicked */
  (e: 'close'): void;
}>();
</script>
