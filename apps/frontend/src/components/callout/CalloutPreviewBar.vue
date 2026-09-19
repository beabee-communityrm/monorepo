<!--
  # CalloutPreviewBar
  Banner shown while a reviewer previews a CrowdNewsroom. Teleports into the
  Dashboard layout's `#sticky-top-banner` target so it sits full-width under
  the navbar — see `layout-Dashboard.vue`. Leaving preview drops the
  `preview` query param, which is what puts the page into preview mode.
-->
<template>
  <Teleport to="#sticky-top-banner">
    <UAlert
      icon="i-lucide-eye"
      color="warning"
      variant="subtle"
      orientation="horizontal"
      class="rounded-none"
      :description="t('callout.showingPreview-nuxt')"
      :actions="[
        {
          label: t('callout.leavePreview'),
          color: 'warning',
          variant: 'outline',
          class: 'bg-white',
          onClick: leavePreview,
        },
      ]"
    />
  </Teleport>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

function leavePreview() {
  router.replace({ query: { ...route.query, preview: undefined } });
}
</script>
