<template>
  <AppExpandableBox
    :button-icon="faShareNodes"
    :button-text="t('actions.share')"
  >
    <p class="mb-2">{{ addressText }}</p>

    <div class="mb-4 flex items-center rounded pl-3">
      <span class="mr-2 flex-1 text-link">{{ fullUrl }}</span>
      <AppButton :icon="faCopy" size="sm" @click="copyToClipboard">
        {{ t('actions.copy') }}
      </AppButton>
    </div>

    <p class="mb-2">{{ servicesText }}</p>

    <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
      <div>
        <a
          :href="
            'https://www.facebook.com/sharer/sharer.php?u=' +
            encodeURIComponent(fullUrl)
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
            encodeURIComponent(fullUrl)
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
            'https://telegram.me/share/url?url=' + encodeURIComponent(fullUrl)
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
          :href="'https://twitter.com/share?url=' + encodeURIComponent(fullUrl)"
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
            'https://api.whatsapp.com/send?text=' + encodeURIComponent(fullUrl)
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
          :href="'mailto:?body=' + encodeURIComponent(fullUrl)"
          target="_blank"
          rel="nofollow noopener"
        >
          <font-awesome-icon :icon="faEnvelope" class="mr-1" />
          {{ t('form.email') }}
        </a>
      </div>
    </div>
  </AppExpandableBox>
</template>

<script lang="ts" setup>
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
import { useI18n } from 'vue-i18n';
import AppButton from '@components/button/AppButton.vue';
import AppExpandableBox from '@components/AppExpandableBox.vue';
import { computed } from 'vue';
import env from '@env';

const { t } = useI18n();

const props = defineProps<{
  url: string;
  addressText: string;
  servicesText: string;
}>();

const fullUrl = computed(() => env.appUrl + props.url);

const copyToClipboard = () => navigator.clipboard.writeText(fullUrl.value);
</script>
