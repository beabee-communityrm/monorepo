<template>
  <div>
    <div class="mb-4 flex">
      <div class="flex-1">
        <AppSubHeading>{{ callout.title }}</AppSubHeading>
        <p class="mb-3">{{ callout.excerpt }}</p>
      </div>
      <div class="flex-0 ml-4">
        <img class="w-[150px]" :src="imageUrl" />
      </div>
    </div>
    <div class="mb-4 text-sm">
      <ItemStatusText
        class="font-semibold text-body-60"
        :status="callout.status"
        :status-text="t('common.status.' + callout.status)"
        :starts="callout.starts"
        :expires="callout.expires"
        :scheduled-text="
          callout.status === 'scheduled' && callout.starts
            ? t('item.status.startsIn', {
                duration: formatDistanceLocale(callout.starts, new Date()),
              })
            : ''
        "
        :open-text="
          callout.status === 'open' && callout.expires
            ? t('item.status.endsIn', {
                duration: formatDistanceLocale(callout.expires, new Date()),
              })
            : ''
        "
        :ended-text="
          callout.status === 'ended' && callout.expires
            ? t('common.timeAgo', {
                time: formatDistanceLocale(callout.expires, new Date()),
              })
            : ''
        "
        inline
        circle
      />
      <ItemDateRange
        :starts="callout.starts"
        :expires="callout.expires"
        :locale="locale as BaseLocale"
      />
      <p>
        <router-link :to="calloutLink" class="relative z-10">
          <font-awesome-icon :icon="faExternalLinkAlt" />
          <span class="ml-2 text-link">{{ env.appUrl }}{{ calloutLink }}</span>
        </router-link>
      </p>
    </div>

    <div class="text-right">
      <router-link
        :to="`/admin/callouts/view/${callout.slug}/responses`"
        class="relative z-10"
      >
        <AppButton class="text-sm font-semibold">
          {{ t('adminDashboard.seeAllResponses') }} ({{
            callout.responseCount
          }})
        </AppButton>
      </router-link>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type { GetCalloutDataWith } from '@beabee/beabee-common';
import type { BaseLocale } from '@beabee/locale';
import { AppButton, ItemDateRange, ItemStatusText } from '@beabee/vue';

import AppSubHeading from '@components/AppSubHeading.vue';
import env from '@env';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { formatDistanceLocale } from '@utils/dates';
import { resolveImageUrl } from '@utils/url';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import noImage from '../../assets/images/no-image.avif';

const { t, locale } = useI18n();

const props = defineProps<{
  callout: GetCalloutDataWith<'responseCount'>;
}>();

const imageUrl = computed(() => {
  return props.callout.image
    ? resolveImageUrl(props.callout.image, 600)
    : noImage;
});

const calloutLink = computed(() => `/callouts/${props.callout.slug}`);
</script>
