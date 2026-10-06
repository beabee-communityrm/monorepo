<!--
  # HomeLoadError
  The line a home page card shows in place of its content when it couldn't be
  loaded, pointing to the organisation's support email.
-->
<template>
  <i18n-t keypath="homePage.loadError" tag="p" class="text-muted">
    <template #support>
      <a
        :href="`mailto:${generalContent.supportEmail}`"
        class="text-primary underline"
      >
        {{ generalContent.supportEmail }}
      </a>
    </template>
  </i18n-t>
</template>

<script lang="ts" setup>
import { generalContent } from '#store';
</script>
