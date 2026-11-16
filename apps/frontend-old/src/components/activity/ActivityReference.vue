<!--
  # ActivityReference
  Shows the name of an activity event's actor or target, linked to its admin
  page where it has one
-->
<template>
  <router-link v-if="reference && link" :to="link" class="text-link">
    {{ reference.name }}
  </router-link>
  <template v-else>{{ reference?.name || fallback }}</template>
</template>

<script lang="ts" setup>
import type { ActivityEventReference } from '@beabee/beabee-common';

import { computed } from 'vue';

import { getReferenceLink } from '#utils/activity';

const props = defineProps<{
  /** The actor or target, null if it has none or it no longer exists */
  reference: ActivityEventReference | null;
  /** Text to show when there is no reference */
  fallback?: string | null;
}>();

const link = computed(
  () => props.reference && getReferenceLink(props.reference)
);
</script>
