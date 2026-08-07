<!-- SCRATCH PREVIEW — delete once CalloutResponseCard is signed off and wired into the real detail page -->
<route lang="yaml">
meta:
  noAuth: true
</route>

<template>
  <div class="nuxt-page flex flex-col gap-8 p-8">
    <p class="font-medium">Narrow container (sidebar width)</p>
    <div class="max-w-sm">
      <p class="text-muted mb-2 text-sm">Not responded</p>
      <CalloutResponseCard
        respond-to="/crowdnewsroom/test-atlas/respond"
        :has-responded="false"
        :can-update="true"
      />
    </div>

    <div class="max-w-sm">
      <p class="text-muted mb-2 text-sm">Responded, can update</p>
      <CalloutResponseCard
        respond-to="/crowdnewsroom/test-atlas/respond"
        :has-responded="true"
        :can-update="true"
        :submitted-at="new Date('2026-08-04')"
      />
    </div>

    <div class="max-w-sm">
      <p class="text-muted mb-2 text-sm">Responded, can't update (closed)</p>
      <CalloutResponseCard
        respond-to="/crowdnewsroom/test-atlas/respond"
        :has-responded="true"
        :can-update="false"
        :submitted-at="new Date('2026-02-14')"
      />
    </div>

    <p class="font-medium">Wide container (full content width)</p>
    <div class="max-w-2xl">
      <p class="text-muted mb-2 text-sm">Not responded</p>
      <CalloutResponseCard
        respond-to="/crowdnewsroom/test-atlas/respond"
        :has-responded="false"
        :can-update="true"
      />
    </div>

    <div class="max-w-2xl">
      <p class="text-muted mb-2 text-sm">Responded, can update</p>
      <CalloutResponseCard
        respond-to="/crowdnewsroom/test-atlas/respond"
        :has-responded="true"
        :can-update="true"
        :submitted-at="new Date('2026-08-04')"
      />
    </div>

    <div class="max-w-2xl">
      <p class="text-muted mb-2 text-sm">Responded, can't update (closed)</p>
      <CalloutResponseCard
        respond-to="/crowdnewsroom/test-atlas/respond"
        :has-responded="true"
        :can-update="false"
        :submitted-at="new Date('2026-02-14')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import CalloutResponseCard from '#components/callout/CalloutResponseCard.vue';
</script>
