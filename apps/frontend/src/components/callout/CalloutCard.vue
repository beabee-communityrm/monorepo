<template>
  <div
    class="callout-card group w-full cursor-pointer overflow-hidden rounded bg-white shadow md:max-w-[19rem]"
  >
    <router-link :to="`/callouts/${callout.slug}`" class="flex h-full flex-col">
      <div class="h-36 bg-primary-40">
        <img
          v-if="callout.image"
          class="h-full w-full object-cover"
          :src="callout.image"
          :alt="callout.title"
        />
      </div>

      <div class="flex-grow p-4">
        <AppSubHeading>{{ callout.title }}</AppSubHeading>

        <p class="mb-2 text-sm">{{ callout.excerpt }}</p>

        <div class="mb-3 flex items-end text-sm">
          <div v-if="callout.expires" class="ml-auto flex flex-col text-right">
            <span class="font-semibold">{{
              `${t('common.until')} ${formatLocale(callout.expires, 'MMMM d')}`
            }}</span>
            <AppTime class="text-body-80" :datetime="callout.expires" />
          </div>
        </div>
      </div>

      <div
        class="flex h-11 items-center bg-primary-10 px-5 text-primary-80 group-hover:bg-primary-20 group-hover:text-primary"
      >
        <span class="mary-80 ml-auto font-semibold">{{
          t('actions.participate')
        }}</span>
      </div>
    </router-link>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import AppTime from '../AppTime.vue';
import AppSubHeading from '../AppSubHeading.vue';
import { formatLocale } from '@utils/dates';

import type { GetCalloutData } from '@type';

defineProps<{ callout: GetCalloutData }>();

const { t } = useI18n();
</script>
