<!--
  # AppShareBox
  A component for sharing URLs across various social media platforms and methods.
  Provides a collapsible box with social sharing options and a copy-to-clipboard feature.

  ## Features:
  - Multiple social media sharing options (Facebook, LinkedIn, Telegram, Twitter, WhatsApp)
  - Email sharing support
  - Copy-to-clipboard functionality
  - Collapsible interface using AppExpandableBox
  - Full keyboard navigation support
  - Accessibility features with ARIA labels
  - Mobile-first responsive design

  ## Usage:
  ```vue
  <AppShareBox
    url="/my-page"
    base-url="https://example.com"
    share-text="Check out this page"
    copy-text="Copy link"
    address-text="Share this page using the address below:"
    services-text="Or share via social media:"
  />
  ```
-->
<template>
  <AppExpandableBox
    :button-icon="faShareNodes"
    :button-text="shareText"
    role="region"
    :aria-label="shareText"
  >
    <div class="space-y-4">
      <!-- Address section -->
      <section>
        <p class="mb-2 text-sm text-body-80">{{ addressText }}</p>
        <div
          class="bg-grey-lightest flex items-center rounded border border-grey-light px-3 py-2"
          role="group"
          :aria-label="addressText"
        >
          <span
            class="mr-2 flex-1 break-all text-link"
            :id="`${componentId}-url`"
            role="text"
            :aria-label="`URL: ${fullUrl}`"
          >
            {{ fullUrl }}
          </span>
          <AppButton
            :icon="faCopy"
            size="sm"
            variant="greyOutlined"
            :aria-describedby="`${componentId}-url`"
            :aria-label="`${copyText}: ${fullUrl}`"
            @click="copyToClipboard"
          >
            {{ copyText }}
          </AppButton>
        </div>
      </section>

      <!-- Social sharing section -->
      <section>
        <p class="mb-3 text-sm text-body-80">{{ servicesText }}</p>
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
            :aria-label="`Share on Facebook: ${fullUrl}`"
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
            :aria-label="`Share on LinkedIn: ${fullUrl}`"
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
            :aria-label="`Share on Telegram: ${fullUrl}`"
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
            :aria-label="`Share on Twitter: ${fullUrl}`"
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
            :aria-label="`Share on WhatsApp: ${fullUrl}`"
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
            :aria-label="`Share via email: ${fullUrl}`"
          >
            <font-awesome-icon
              :icon="faEnvelope"
              class="mr-2 text-body-60"
              aria-hidden="true"
            />
            <span>{{ emailText }}</span>
          </a>
        </nav>
      </section>
    </div>
  </AppExpandableBox>
</template>

<script lang="ts" setup>
/**
 * AppShareBox component for sharing URLs across social media platforms and via email.
 * Provides a collapsible interface with multiple sharing options and copy-to-clipboard functionality.
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
import {
  faCopy,
  faEnvelope,
  faShareNodes,
} from '@fortawesome/free-solid-svg-icons';
import { computed } from 'vue';

import { AppButton, AppExpandableBox } from '../..';

/**
 * Props for the AppShareBox component
 */
export interface AppShareBoxProps {
  /** The relative URL or path to be shared */
  url: string;
  /** The base URL to prepend to the relative URL */
  baseUrl: string;
  /** Text label for the share button */
  shareText: string;
  /** Text label for the copy button */
  copyText: string;
  /** Text describing the address/URL section */
  addressText: string;
  /** Text describing the social media services section */
  servicesText: string;
  /** Text label for the email sharing option */
  emailText: string;
}

const props = withDefaults(defineProps<AppShareBoxProps>(), {
  shareText: 'Share',
  copyText: 'Copy',
  addressText: 'Share this address:',
  servicesText: 'Or share via social media:',
  emailText: 'Email',
});

/**
 * Events emitted by the AppShareBox component
 */
const emit = defineEmits<{
  /**
   * Emitted when the URL is successfully copied to clipboard
   * @param url - The URL that was copied
   */
  copied: [url: string];
  /**
   * Emitted when copying to clipboard fails
   * @param error - The error that occurred
   */
  copyError: [error: Error];
}>();

// Generate unique component ID for accessibility
const componentId = computed(
  () => `share-box-${Math.random().toString(36).substring(2, 11)}`
);

/**
 * Computed full URL combining base URL and relative URL
 */
const fullUrl = computed(() => {
  const base = props.baseUrl.endsWith('/')
    ? props.baseUrl.slice(0, -1)
    : props.baseUrl;
  const url = props.url.startsWith('/') ? props.url : `/${props.url}`;
  return base + url;
});

/**
 * Copies the full URL to the clipboard
 */
async function copyToClipboard(): Promise<void> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(fullUrl.value);
      emit('copied', fullUrl.value);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = fullUrl.value;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      if (document.execCommand('copy')) {
        emit('copied', fullUrl.value);
      } else {
        throw new Error('Copy command failed');
      }

      document.body.removeChild(textArea);
    }
  } catch (error) {
    emit(
      'copyError',
      error instanceof Error ? error : new Error('Failed to copy to clipboard')
    );
  }
}
</script>
