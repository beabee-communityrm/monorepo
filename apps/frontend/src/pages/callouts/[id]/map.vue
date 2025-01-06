<route lang="yaml">
name: calloutMap
meta:
  pageTitle: menu.callouts
  noAuth: true
  layout: Fullscreen
  embeddable: true
</route>

<template>
  <div
    v-if="callout.responseViewSchema?.map"
    class="absolute inset-0 flex flex-col"
  >
    <CalloutMapHeader
      v-if="!isEmbed"
      :callout="callout"
      class="flex-0"
      map
      @addnew="handleStartAddMode"
    />
    <div class="relative flex-1">
      <MglMap
        :center="callout.responseViewSchema.map.center"
        :zoom="callout.responseViewSchema.map.initialZoom"
        :map-style="callout.responseViewSchema.map.style"
        :max-zoom="callout.responseViewSchema.map.maxZoom"
        :min-zoom="callout.responseViewSchema.map.minZoom"
        :max-bounds="callout.responseViewSchema.map.bounds"
        :language="currentLocaleConfig.baseLocale"
        @map:load="handleLoad"
        @map:click="handleClick"
        @map:mousemove="handleMouseOver"
      >
        <MglNavigationControl />
        <MglScaleControl />
        <MglGeolocationControl />

        <MglGeoJsonSource
          source-id="responses"
          :data="responsesCollecton"
          cluster
          :cluster-properties="{
            all_responses: ['concat', ['get', 'all_responses']],
            first_response: ['min', ['get', 'first_response']],
          }"
        >
          <MglCircleLayer
            layer-id="clusters"
            :filter="['has', 'point_count']"
            :paint="{
              'circle-color': 'black',
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                100,
                30,
                750,
                40,
              ],
            }"
          />
          <MglSymbolLayer
            layer-id="cluster-counts"
            :filter="['has', 'point_count']"
            :paint="{ 'text-color': 'white' }"
            :layout="{
              'text-field': '{point_count_abbreviated}',
              'text-size': 16,
              'text-font': ['Bold'],
            }"
          />
          <MglCircleLayer
            layer-id="unclustered-points"
            :filter="['!', ['has', 'point_count']]"
            :paint="{
              'circle-color': 'black',
              'circle-radius': 10,
            }"
          />
        </MglGeoJsonSource>
        <MglGeoJsonSource
          v-if="selectedFeature"
          source-id="selected-response"
          :data="selectedFeature"
        >
          <MglCircleLayer
            layer-id="selected-response"
            :paint="{
              'circle-stroke-color': 'red',
              'circle-stroke-width': 2,
              'circle-color': 'transparent',
              'circle-radius': 20,
            }"
          />
        </MglGeoJsonSource>
        <MglMarker
          v-if="newResponseAddress"
          :coordinates="newResponseAddress.geometry.location"
          color="black"
        />
        <MglMarker
          v-if="geocodeAddress"
          :coordinates="geocodeAddress.geometry.location"
        />
      </MglMap>

      <transition name="add-notice">
        <div
          v-if="isAddMode && !newResponseAnswers"
          class="absolute inset-x-0 top-10 flex justify-center md:top-20"
        >
          <p class="mx-4 rounded bg-white p-4 font-bold shadow-lg">
            <font-awesome-icon :icon="faInfoCircle" class="mr-1" />
            {{ t('callout.addAPoint') }}.
            <span class="cursor-pointer underline" @click="handleCancelAddMode"
              >{{ t('actions.cancel') }}?</span
            >
          </p>
        </div>
      </transition>
    </div>
    <div
      v-if="isOpen && !isAddMode && isEmbed"
      class="absolute bottom-8 right-8 hidden md:block"
    >
      <AppButton
        variant="link"
        class="shadow-md"
        @click.prevent="handleStartAddMode"
      >
        <font-awesome-icon :icon="faPlus" class="text" />
        {{ t('callout.addLocation') }}
      </AppButton>
    </div>

    <!-- Bottom bar for mobile only -->
    <div
      class="z-20 flex justify-center px-6 py-4 shadow-[0px_-10px_15px_-3px_rgba(0,0,0,0.1)] md:hidden"
    >
      <div>
        <AppButton
          v-if="isOpen"
          variant="link"
          class="px-2"
          @click.prevent="handleStartAddMode"
        >
          <font-awesome-icon :icon="faPlus" class="text" />
          {{ t('callout.addLocation') }}
        </AppButton>
      </div>
    </div>

    <!-- Side panel width reference to offset map center -->
    <div ref="sidePanelRef" class="absolute left-0 w-full max-w-lg" />

    <CalloutShowResponsePanel
      :callout="callout"
      :responses="selectedResponses"
      @close="router.push({ ...route, hash: '' })"
    />

    <CalloutIntroPanel
      v-if="!isEmbed || route.query.intro !== undefined"
      :callout="callout"
      :show="introOpen"
      @close="introOpen = false"
    />

    <CalloutAddResponsePanel
      :callout="callout"
      :answers="newResponseAnswers"
      @close="handleCancelAddMode"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeMount, onMounted, ref, toRef, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  MglMap,
  MglGeoJsonSource,
  MglCircleLayer,
  MglSymbolLayer,
  useMap,
  MglMarker,
  MglNavigationControl,
  MglScaleControl,
  MglGeolocationControl,
} from 'vue-maplibre-gl';
import type {
  GeoJSONSource,
  LngLatLike,
  Map,
  MapMouseEvent,
} from 'maplibre-gl';
import type GeoJSON from 'geojson';

import 'maplibre-gl/dist/maplibre-gl.css';
import 'vue-maplibre-gl/dist/vue-maplibre-gl.css';

import type {
  CalloutResponseAnswerAddress,
  CalloutResponseAnswersSlide,
  GetCalloutDataWith,
  GetCalloutResponseMapData,
} from '@beabee/beabee-common';
import { faInfoCircle, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useI18n } from 'vue-i18n';
import { GeocodingControl } from '@maptiler/geocoding-control/maplibregl';
import '@maptiler/geocoding-control/style.css';

import CalloutShowResponsePanel from '@components/pages/callouts/CalloutShowResponsePanel.vue';
import CalloutIntroPanel from '@components/pages/callouts/CalloutIntroPanel.vue';
import CalloutAddResponsePanel from '@components/pages/callouts/CalloutAddResponsePanel.vue';
import {
  HASH_PREFIX,
  useCallout,
} from '@components/pages/callouts/use-callout';

import { setKey } from '@utils';
import {
  type GeocodeResult,
  featureToAddress,
  reverseGeocode,
  formatGeocodeResult,
} from '@utils/geocode';
import { fetchResponsesForMap } from '@utils/api/callout';

import env from '../../../env';
import AppButton from '@components/button/AppButton.vue';

import { isEmbed } from '@store';

import { currentLocaleConfig } from '@lib/i18n';
import CalloutMapHeader from '@components/pages/callouts/CalloutMapHeader.vue';
import type { GeocodePickEvent } from '@type';

type GetCalloutResponseMapDataWithAddress = GetCalloutResponseMapData & {
  address: CalloutResponseAnswerAddress;
};

const props = defineProps<{
  callout: GetCalloutDataWith<'form' | 'responseViewSchema' | 'variantNames'>;
  // Suppress the warning about the ID prop being passed by the router
  id: string;
}>();

const map = useMap();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const sidePanelRef = ref<HTMLElement>();

const responses = ref<GetCalloutResponseMapDataWithAddress[]>([]);

const { isOpen } = useCallout(toRef(props, 'callout'));

const introOpen = ref(false);
const newResponseAnswers = ref<CalloutResponseAnswersSlide>();
const geocodeAddress = ref<CalloutResponseAnswerAddress>();

const isAddMode = computed(() => route.hash === '#add');

// Use the address from the new response to show a marker on the map
const newResponseAddress = computed(() => {
  const addressProp = props.callout.responseViewSchema?.map?.addressProp;
  if (addressProp && newResponseAnswers.value) {
    const [slideId, answerKey] = addressProp.split('.');
    return newResponseAnswers.value[slideId]?.[answerKey] as
      | CalloutResponseAnswerAddress
      | undefined;
  }
  return undefined;
});

interface PointProps {
  all_responses: string;
  first_response: number;
}

interface ClusterProps extends PointProps {
  cluster_id: number;
}

type PointFeature = GeoJSON.Feature<GeoJSON.Point, PointProps>;
type ClusterFeature = GeoJSON.Feature<GeoJSON.Point, ClusterProps>;

// A GeoJSON FeatureCollection of all the responses
const responsesCollecton = computed<
  GeoJSON.FeatureCollection<GeoJSON.Point, PointProps>
>(() => {
  return {
    type: 'FeatureCollection',
    features: responses.value.map((response) => {
      const { lat, lng } = response.address.geometry.location;

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        properties: {
          all_responses: `<${response.number}>`,
          first_response: response.number,
        },
      };
    }),
  };
});

// The currently selected response or cluster GeoJSON Feature
const selectedFeature = computed(() => {
  if (!route.hash.startsWith(HASH_PREFIX)) return undefined;

  // Map hasn't finished loading yet
  if (!map.map?.getLayer('clusters')) return;
  // TODO: go again when it has loaded

  const responseNumber = Number(route.hash.slice(HASH_PREFIX.length));

  return map.map.queryRenderedFeatures({
    layers: ['unclustered-points', 'clusters'],
    filter: ['in', `<${responseNumber}>`, ['get', 'all_responses']],
  })[0] as unknown as PointFeature | undefined;
});

const selectedResponses = computed(() => {
  if (!selectedFeature.value) return [];

  const responseNumbers = selectedFeature.value.properties.all_responses;

  return (
    responseNumbers
      // Remove first < and last >
      .substring(1, responseNumbers.length - 1)
      // Split each response number
      .split('><')
      .map(Number)
      .map((n) => responses.value.find((r) => r.number === n))
      .filter((r): r is GetCalloutResponseMapDataWithAddress => !!r)
  );
});

/**
 * Centre the map on the selected feature when it changes
 */
watch(selectedFeature, (newFeature) => {
  if (!map.map || !newFeature) return;

  introOpen.value = false;

  map.map.easeTo({
    center: newFeature.geometry.coordinates as LngLatLike,
    padding: { left: sidePanelRef.value?.offsetWidth || 0 },
  });
});

/**
 * Handle clicking on the map to add a new response. This will set the new response
 * address and geocode it to get a formatted address
 *
 * @param e The click event
 */
async function handleAddClick(e: { event: MapMouseEvent; map: Map }) {
  const mapSchema = props.callout.responseViewSchema?.map;
  if (!mapSchema) return; // Can't actually happen

  const coords = e.event.lngLat;
  e.map.getCanvas().style.cursor = '';

  e.map.easeTo({
    center: coords,
    padding: { left: sidePanelRef.value?.offsetWidth || 0 },
  });

  const geocodeResult = await reverseGeocode(coords.lat, coords.lng);

  const address: GeocodeResult = {
    formatted_address: geocodeResult?.formatted_address || '???',
    features: geocodeResult?.features || [],
    geometry: {
      // Use click location rather than geocode result
      location: coords,
    },
  };

  const responseAnswers: CalloutResponseAnswersSlide = {};
  setKey(responseAnswers, mapSchema.addressProp, address);

  if (mapSchema.addressPatternProp && geocodeResult) {
    const formattedAddress = formatGeocodeResult(
      geocodeResult,
      mapSchema.addressPattern
    );
    setKey(responseAnswers, mapSchema.addressPatternProp, formattedAddress);
  }

  newResponseAnswers.value = responseAnswers;
}

/**
 * Handle clicking on a cluster, either zooming in or opening the first response
 *
 * @param cluster The cluster
 * @param map The map object
 */
function handleClusterClick(cluster: ClusterFeature, map: Map) {
  const mapSchema = props.callout.responseViewSchema?.map;
  if (!mapSchema) return; // Can't actually happen

  const source = map.getSource('responses') as GeoJSONSource;
  source.getClusterExpansionZoom(cluster.properties.cluster_id, (err, zoom) => {
    if (err || zoom == null) return;

    // Maximum zoom level, open first response
    if (zoom >= mapSchema.maxZoom) {
      router.push({
        ...route,
        hash: HASH_PREFIX + cluster.properties.first_response,
      });
      // Zoom to the cluster
    } else {
      map.easeTo({
        center: cluster.geometry.coordinates as LngLatLike,
        zoom: zoom + 1,
      });
    }
  });
}

/**
 * Handle a map click. This could happen when clicking on a cluster, a point, or
 * when adding a new response. This handler delegates accordingly.
 *
 * @param e The click event
 */
function handleClick(e: { event: MapMouseEvent; map: Map }) {
  if (isAddMode.value) {
    if (!newResponseAnswers.value) {
      handleAddClick(e);
    }
  } else {
    // Map not loaded yet
    if (!e.map.getLayer('clusters')) return;

    const [point] = e.map.queryRenderedFeatures(e.event.point, {
      layers: ['clusters', 'unclustered-points'],
    });

    if (point?.layer.id === 'clusters') {
      handleClusterClick(point as unknown as ClusterFeature, e.map);
    } else {
      // Open the response or clear the hash
      router.push({
        ...route,
        hash: point ? HASH_PREFIX + point.properties.first_response : '',
      });
    }
  }
}

// Add a cursor when hovering over a cluster or a point
function handleMouseOver(e: { event: MapMouseEvent; map: Map }) {
  if (isAddMode.value) return;

  // Map not loaded yet
  if (!e.map.getLayer('clusters')) return;

  const features = e.map.queryRenderedFeatures(e.event.point, {
    layers: ['clusters', 'unclustered-points'],
  });

  e.map.getCanvas().style.cursor = features.length > 0 ? 'pointer' : '';
}

// Start add response mode
function handleStartAddMode() {
  router.push({ ...route, hash: '#add' });
}

// Cancel add response mode, clearing any state that is left over
function handleCancelAddMode() {
  router.push({ ...route, hash: '' });
}

/**
 * Handle map load. Add a geocoding control to the map if a key is available
 *
 * @param e The map load event
 */
function handleLoad(e: { map: Map }) {
  if (env.maptilerKey) {
    const geocodeControl = new GeocodingControl({
      apiKey: env.maptilerKey,
      language: currentLocaleConfig.value.baseLocale,
      proximity: [{ type: 'map-center' }],
      country: props.callout.responseViewSchema?.map?.geocodeCountries,
    });

    watch(
      () => currentLocaleConfig.value.baseLocale,
      (newLocale) => {
        geocodeControl.setOptions({
          apiKey: env.maptilerKey, // Incorrect type means we have to pass this again
          language: newLocale,
        });
      }
    );

    geocodeControl.addEventListener('pick', (e: Event) => {
      const event = e as GeocodePickEvent;
      geocodeAddress.value = event.detail
        ? featureToAddress(event.detail)
        : undefined;
    });

    e.map.addControl(geocodeControl, 'top-left');
  }
}

// Toggle add mode
watch(isAddMode, (v) => {
  if (!map.map) return;
  if (v) {
    introOpen.value = false;
    map.map.getCanvas().style.cursor = 'crosshair';
  } else {
    newResponseAnswers.value = undefined;
    map.map.getCanvas().style.cursor = '';
  }
});

// Load callout and responses
onBeforeMount(async () => {
  if (!props.callout.responseViewSchema?.map) {
    throw new Error('Callout does not have a map schema');
  }

  // TODO: pagination
  responses.value = (
    await fetchResponsesForMap(props.callout.slug)
  ).items.filter((r): r is GetCalloutResponseMapDataWithAddress => !!r.address);
});

onMounted(async () => {
  // intro panel is shown by default, but not in some cases (e.g. when
  // switching from the gallery view)
  if (!route.query.noIntro) {
    introOpen.value = true;
  }
});
</script>

<style lang="postcss" scoped>
.add-notice-enter-active,
.add-notice-leave-active {
  @apply transition;
}

.add-notice-enter-from,
.add-notice-leave-to {
  @apply -translate-y-8 opacity-0;
}

.add-notice-enter-to,
.add-notice-leave-from {
  @apply translate-y-0 opacity-100;
}
</style>
