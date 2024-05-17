<template>
  <div>
    <div class="mb-4 flex">
      <div class="flex-1">
        <AppSubHeading>{{ callout.title }}</AppSubHeading>
        <p class="mb-3">{{ callout.excerpt }}</p>
      </div>
      <div class="flex-0 ml-4">
        <img class="w-[150px]" :src="callout.image" />
      </div>
    </div>
    <div class="mb-4 text-sm">
      <ItemStatusText
        class="font-semibold text-body-60"
        :item="callout"
        inline
        circle
      />
      <ItemDateRange :item="callout"></ItemDateRange>
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
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

import env from '@env';

import ItemStatusText from '@components/item/ItemStatusText.vue';
import ItemDateRange from '@components/item/ItemDateRange.vue';
import AppSubHeading from '@components/AppSubHeading.vue';
import AppButton from '@components/button/AppButton.vue';

import type { GetCalloutDataWith } from '@type';

const { t } = useI18n();

const props = defineProps<{
  callout: GetCalloutDataWith<'responseCount'>;
}>();

const calloutLink = computed(() => `/callouts/${props.callout.slug}`);
</script>
