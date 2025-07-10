<!--
  # AppShareBox
  A component for sharing content via various platforms.

  ## Features
  - Share buttons for social media platforms
  - Email sharing option
  - Copy-to-clipboard functionality for links
  - Responsive layout

  ## Props
  - `url`: The full URL to be shared

  ## Slots
  - Default slot for additional content

  ## Usage:
  - Place in any layout where sharing functionality is needed
  - Pass the complete URL to be shared
  - Content will automatically be shared based on the provided URL
-->
<template>
  <AppExpandableBox
    :button-icon="faShareNodes"
    :button-text="t('actions.share')"
    role="region"
    :aria-label="t('actions.share')"
  >
    <div class="space-y-4">
      <!-- Address section -->
      <section>
        <AppInput
          :model-value="fullUrl"
          :label="t('callout.share.address')"
          disabled
          copyable
          :copy-label="t('actions.copy')"
          :aria-label="`URL: ${fullUrl}`"
          hide-error-message
        />
      </section>

      <!-- Social sharing section -->
      <section>
        <p class="mb-3 text-sm text-body-80">
          {{ t('callout.share.services') }}
        </p>
        <nav
          class="grid grid-cols-2 gap-3 sm:grid-cols-3"
          role="navigation"
          aria-label="Social sharing options"
        >
          <!-- Facebook -->
          <a
            :href="`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`"
            target="_blank"
            rel="nofollow noopener"
            class="hover:bg-grey-lightest flex items-center rounded border border-grey-light bg-white px-3 py-2 text-sm text-body transition-colors focus:outline-none focus:ring-2 focus:ring-primary-70 focus:ring-offset-2"
            :aria-label="`${t('callout.share.aria.facebook')}: ${fullUrl}`"
          >
            <font-awesome-icon
              :icon="faFacebook"
              class="mr-2 text-[#1877f2]"
              aria-hidden="true"
            />
            <span>Facebook</span>
          </a>

          <!-- LinkedIn -->
          <a
            :href="`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(fullUrl)}`"
            target="_blank"
            rel="nofollow noopener"
            class="hover:bg-grey-lightest flex items-center rounded border border-grey-light bg-white px-3 py-2 text-sm text-body transition-colors focus:outline-none focus:ring-2 focus:ring-primary-70 focus:ring-offset-2"
            :aria-label="`${t('callout.share.aria.linkedin')}: ${fullUrl}`"
          >
            <font-awesome-icon
              :icon="faLinkedin"
              class="mr-2 text-[#0a66c2]"
              aria-hidden="true"
            />
            <span>LinkedIn</span>
          </a>

          <!-- Telegram -->
          <a
            :href="`https://telegram.me/share/url?url=${encodeURIComponent(fullUrl)}`"
            target="_blank"
            rel="nofollow noopener"
            class="hover:bg-grey-lightest flex items-center rounded border border-grey-light bg-white px-3 py-2 text-sm text-body transition-colors focus:outline-none focus:ring-2 focus:ring-primary-70 focus:ring-offset-2"
            :aria-label="`${t('callout.share.aria.telegram')}: ${fullUrl}`"
          >
            <font-awesome-icon
              :icon="faTelegram"
              class="mr-2 text-[#0088cc]"
              aria-hidden="true"
            />
            <span>Telegram</span>
          </a>

          <!-- Twitter -->
          <a
            :href="`https://twitter.com/share?url=${encodeURIComponent(fullUrl)}`"
            target="_blank"
            rel="nofollow noopener"
            class="hover:bg-grey-lightest flex items-center rounded border border-grey-light bg-white px-3 py-2 text-sm text-body transition-colors focus:outline-none focus:ring-2 focus:ring-primary-70 focus:ring-offset-2"
            :aria-label="`${t('callout.share.aria.twitter')}: ${fullUrl}`"
          >
            <font-awesome-icon
              :icon="faTwitter"
              class="mr-2 text-[#1da1f2]"
              aria-hidden="true"
            />
            <span>Twitter</span>
          </a>

          <!-- WhatsApp -->
          <a
            :href="`https://api.whatsapp.com/send?text=${encodeURIComponent(fullUrl)}`"
            target="_blank"
            rel="nofollow noopener"
            class="hover:bg-grey-lightest flex items-center rounded border border-grey-light bg-white px-3 py-2 text-sm text-body transition-colors focus:outline-none focus:ring-2 focus:ring-primary-70 focus:ring-offset-2"
            :aria-label="`${t('callout.share.aria.whatsapp')}: ${fullUrl}`"
          >
            <font-awesome-icon
              :icon="faWhatsapp"
              class="mr-2 text-[#25d366]"
              aria-hidden="true"
            />
            <span>WhatsApp</span>
          </a>

          <!-- Email -->
          <a
            :href="`mailto:?body=${encodeURIComponent(fullUrl)}`"
            target="_blank"
            rel="nofollow noopener"
            class="hover:bg-grey-lightest flex items-center rounded border border-grey-light bg-white px-3 py-2 text-sm text-body transition-colors focus:outline-none focus:ring-2 focus:ring-primary-70 focus:ring-offset-2"
            :aria-label="`${t('callout.share.aria.email')}: ${fullUrl}`"
          >
            <font-awesome-icon
              :icon="faEnvelope"
              class="mr-2 text-body-60"
              aria-hidden="true"
            />
            <span>{{ t('form.email') }}</span>
          </a>
        </nav>
      </section>
    </div>
  </AppExpandableBox>
</template>

<script lang="ts" setup>
/**
 * AppShareBox component for sharing content across various platforms
 *
 * @component AppShareBox
 */
import {
  faFacebook,
  faLinkedin,
  faTelegram,
  faTwitter,
  faWhatsapp,
} from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faShareNodes } from '@fortawesome/free-solid-svg-icons';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { AppExpandableBox, AppInput } from '../..';

const { t } = useI18n();

/**
 * Props for the AppShareBox component
 */
export interface AppShareBoxProps {
  /** The full URL to be shared */
  url: string;
}

const props = defineProps<AppShareBoxProps>();

/**
 * The URL to share (already complete)
 */
const fullUrl = computed(() => props.url);
</script>
