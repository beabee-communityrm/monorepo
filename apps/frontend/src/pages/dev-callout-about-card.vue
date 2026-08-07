<!-- SCRATCH PREVIEW — delete once CalloutAboutCard is signed off and wired into the real detail page -->
<route lang="yaml">
meta:
  noAuth: true
</route>

<template>
  <div class="nuxt-page flex flex-col gap-8 p-8">
    <div class="max-w-sm">
      <p class="text-muted mb-2 text-sm">Narrow container (sidebar width)</p>
      <CalloutAboutCard
        :starts="new Date('2026-06-01')"
        :expires="new Date('2026-07-31')"
        :response-count="3"
        :access="CalloutAccess.Guest"
        share-url="https://beabee.io/crowdnewsroom/test-atlas"
      />
    </div>

    <div class="max-w-sm">
      <p class="text-muted mb-2 text-sm">
        Narrow container: members only, no end date, singular response
      </p>
      <CalloutAboutCard
        :starts="new Date('2026-06-01')"
        :response-count="1"
        :access="CalloutAccess.Member"
        share-url="https://beabee.io/crowdnewsroom/test-atlas"
      />
    </div>

    <div class="max-w-2xl">
      <p class="text-muted mb-2 text-sm">Wide container (full content width)</p>
      <CalloutAboutCard
        :starts="new Date('2026-06-01')"
        :expires="new Date('2026-07-31')"
        :response-count="3"
        :access="CalloutAccess.Guest"
        share-url="https://beabee.io/crowdnewsroom/test-atlas"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { CalloutAccess } from '@beabee/beabee-common';

import CalloutAboutCard from '#components/callout/CalloutAboutCard.vue';
</script>
