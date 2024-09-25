<template>
  <div class="mb-6 flex h-auto flex-col border border-primary-40 p-5">
    {{ t('callout.share.address') }}

    <div
      class="mb-4 mt-2 flex flex-row items-center justify-between rounded bg-white pl-3"
    >
      <span class="mr-2 text-link">{{ calloutUrl }}</span>
      <AppButton :icon="faCopy" size="sm" @click="copyToClipboard">
        {{ t('actions.copy') }}
      </AppButton>
    </div>

    {{ t('callout.share.services') }}

    <div class="mt-3 grid w-2/3 grid-cols-3 grid-rows-2 gap-2">
      <div>
        <a
          :href="
            'https://www.facebook.com/sharer/sharer.php?u=' +
            encodeURIComponent(calloutUrl)
          "
          target="_blank"
          rel="nofollow noopener"
        >
          <font-awesome-icon :icon="faFacebook" class="mr-1" />
          Facebook
        </a>
      </div>
      <div>
        <a
          :href="
            'https://www.linkedin.com/shareArticle?mini=true&url=' +
            encodeURIComponent(calloutUrl)
          "
          target="_blank"
          rel="nofollow noopener"
        >
          <font-awesome-icon :icon="faLinkedin" class="mr-1" />
          LinkedIn
        </a>
      </div>
      <div>
        <a
          :href="
            'https://telegram.me/share/url?url=' +
            encodeURIComponent(calloutUrl)
          "
          target="_blank"
          rel="nofollow noopener"
        >
          <font-awesome-icon :icon="faTelegram" class="mr-1" />
          Telegram
        </a>
      </div>
      <div>
        <a
          :href="
            'https://twitter.com/share?url=' + encodeURIComponent(calloutUrl)
          "
          target="_blank"
          rel="nofollow noopener"
        >
          <font-awesome-icon :icon="faTwitter" class="mr-1" />
          Twitter
        </a>
      </div>
      <div>
        <a
          :href="
            'https://api.whatsapp.com/send?text=' +
            encodeURIComponent(calloutUrl)
          "
          target="_blank"
          rel="nofollow noopener"
        >
          <font-awesome-icon :icon="faWhatsapp" class="mr-1" />
          WhatsApp
        </a>
      </div>
      <div>
        <a
          :href="'mailto:?body=' + encodeURIComponent(calloutUrl)"
          target="_blank"
          rel="nofollow noopener"
        >
          <font-awesome-icon :icon="faEnvelope" class="mr-1" />
          {{ t('form.email') }}
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  faFacebook,
  faLinkedin,
  faTelegram,
  faTwitter,
  faWhatsapp,
} from '@fortawesome/free-brands-svg-icons';
import { faCopy, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { useI18n } from 'vue-i18n';
import env from '../../../env';
import AppButton from '../../button/AppButton.vue';

const { t } = useI18n();

const props = defineProps<{
  slug: string;
}>();

const calloutUrl = `${env.appUrl}/callouts/${props.slug}`;

const copyToClipboard = () => navigator.clipboard.writeText(calloutUrl);
</script>
