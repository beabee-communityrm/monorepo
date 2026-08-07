<!-- SCRATCH PREVIEW — delete once CalloutMapPreview is signed off and wired into the real detail page -->
<route lang="yaml">
meta:
  noAuth: true
</route>

<template>
  <div class="nuxt-page flex flex-col gap-8 p-8">
    <div class="max-w-2xl">
      <p class="text-muted mb-2 text-sm">Wide container, multiple points</p>
      <CalloutMapPreview
        map-to="/crowdnewsroom/test-atlas/map"
        map-style="https://demotiles.maplibre.org/style.json"
        :points="[
          { lat: 51.4545, lng: -2.5879 },
          { lat: 51.5074, lng: -0.1278 },
          { lat: 53.4808, lng: -2.2426 },
        ]"
      />
    </div>

    <div class="max-w-sm">
      <p class="text-muted mb-2 text-sm">Narrow container, single point</p>
      <CalloutMapPreview
        map-to="/crowdnewsroom/test-atlas/map"
        map-style="https://demotiles.maplibre.org/style.json"
        :points="[{ lat: 51.4545, lng: -2.5879 }]"
      />
    </div>

    <div class="max-w-sm">
      <p class="text-muted mb-2 text-sm">No mapped responses</p>
      <CalloutMapPreview
        map-to="/crowdnewsroom/test-atlas/map"
        map-style="https://demotiles.maplibre.org/style.json"
        :points="[]"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import CalloutMapPreview from '#components/callout/CalloutMapPreview.vue';
</script>
