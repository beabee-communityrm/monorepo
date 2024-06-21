<route lang="yaml">
name: calloutGallery
meta:
  pageTitle: menu.callouts
  noAuth: true
  layout: Fullscreen
  embeddable: true
</route>

<template>
  <div class="absolute inset-0 flex flex-col">
    <CalloutHeader
      v-if="!isEmbed"
      :callout="callout"
      class="flex-0"
      @addnew="
        router.push({ name: 'calloutMap', query: route.query, hash: '#add' })
      "
    />
    <div class="overflow-scroll">
      <ul class="m-3 flex flex-wrap">
        <li
          v-for="response in responses"
          :key="response.number"
          class="min-w-[250px] flex-1 p-3 sm:max-w-sm"
        >
          <router-link
            :to="{ ...route, hash: HASH_PREFIX + response.number }"
            @click="introOpen = false"
          >
            <img
              class="mb-2 aspect-video w-full object-cover"
              loading="lazy"
              :style="{ filter: callout.responseViewSchema?.imageFilter }"
              :src="response.photos[0].url + '?w=400&h=400'"
            />
            <h2>{{ response.title }}</h2>
          </router-link>
        </li>
      </ul>
    </div>

    <transition name="response-panel-bg">
      <div
        v-if="selectedResponse"
        class="fixed inset-0 z-10 bg-black/50"
        @click="router.push({ ...route, hash: '' })"
      />
    </transition>

    <CalloutShowResponsePanel
      :callout="callout"
      :response="selectedResponse"
      @close="
        router.push({ ...route, hash: '' });
        introOpen = false;
      "
      @click.stop
    />

    <CalloutIntroPanel
      v-if="!isEmbed || route.query.intro !== undefined"
      :callout="callout"
      :show="introOpen && !selectedResponse"
      @close="introOpen = false"
    />
  </div>
</template>
<script lang="ts" setup>
import { computed, onBeforeMount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import CalloutShowResponsePanel from '@components/pages/callouts/CalloutShowResponsePanel.vue';
import CalloutIntroPanel from '@components/pages/callouts/CalloutIntroPanel.vue';
import CalloutHeader from '@components/pages/callouts/CalloutHeader.vue';

import { fetchResponsesForMap } from '@utils/api/callout';

import { isEmbed } from '@store';

import type {
  GetCalloutDataWith,
  GetCalloutResponseMapData,
} from '@beabee/beabee-common';

const HASH_PREFIX = '#response-' as const;

const props = defineProps<{
  callout: GetCalloutDataWith<'form' | 'responseViewSchema' | 'variantNames'>;
  // Suppress the warning about the ID prop being passed by the router
  id: string;
}>();

const route = useRoute();
const router = useRouter();

const responses = ref<GetCalloutResponseMapData[]>([]);

const introOpen = ref(false);

const selectedResponse = computed(() => {
  if (route.hash.startsWith(HASH_PREFIX)) {
    const responseNumber = Number(route.hash.slice(HASH_PREFIX.length));
    return responses.value.find((r) => r.number === responseNumber);
  } else {
    return undefined;
  }
});

onBeforeMount(async () => {
  if (!props.callout.responseViewSchema?.gallery) {
    throw new Error('Callout does not have a gallery');
  }

  // TODO: pagination
  responses.value = (
    await fetchResponsesForMap(props.callout.slug)
  ).items.filter((i) => i.photos.length > 0);

  if (!route.query.noIntro) {
    introOpen.value = true;
  }
});
</script>

<style lang="postcss" scoped>
.response-panel-bg-enter-active,
.response-panel-bg-leave-active {
  @apply transition-opacity;
}

.response-panel-bg-enter-from,
.response-panel-bg-leave-to {
  @apply opacity-0;
}

.response-panel-bg-enter-to,
.response-panel-bg-leave-from {
  @apply opacity-100;
}
</style>
