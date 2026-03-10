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
        :item="callout"
        inline
        circle
      />
      <ItemDateRange :item="callout" />
      <p>
        <router-link :to="calloutLink" class="relative z-10">
          <font-awesome-icon :icon="faExternalLinkAlt" />
          <span class="ml-2 text-link">{{ env.appUrl }}{{ calloutLink }}</span>
        </router-link>
      </p>
    </div>

    <div class="text-right">
      <router-link
        :to="`/admin/crowdnewsroom/view/${callout.slug}/responses`"
        class="relative z-10"
      >
        <AppButton class="text-sm font-semibold">
          {{ t('adminDashboard.seeAllResponses') }}
          <span
            v-if="
              callout.responseCount !==
              undefined /* TODO: temporary fix as reviewers can't see response count */
            "
            >({{ callout.responseCount }})</span
          >
        </AppButton>
      </router-link>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type { GetCalloutDataWith } from '@beabee/beabee-common';
import { AppButton, AppSubHeading, ItemDateRange } from '@beabee/vue';

import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import env from '#env';
import { resolveImageUrl } from '#utils/url';

import noImage from '../../assets/images/no-image.avif';
import ItemStatusText from '../item/ItemStatusText.vue';

const { t } = useI18n();

const props = defineProps<{
  callout: GetCalloutDataWith<'responseCount'>;
}>();

const imageUrl = computed(() => {
  return props.callout.image
    ? resolveImageUrl(props.callout.image, 600)
    : noImage;
});

const calloutLink = computed(() => `/crowdnewsroom/${props.callout.slug}`);
</script>
