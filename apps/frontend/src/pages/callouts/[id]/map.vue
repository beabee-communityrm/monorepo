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
        @map:zoom="handleZoom"
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
      :current-response-number="selectedResponseNumber"
      @close="router.push({ ...route, hash: '' })"
      @update:current-response-number="
        router.push({ ...route, hash: HASH_PREFIX + $event })
      "
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
import {
  computed,
  onBeforeMount,
  onMounted,
  ref,
  toRef,
  watch,
  watchEffect,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  MglMap,
  MglGeoJsonSource,
  MglCircleLayer,
  MglSymbolLayer,
  MglMarker,
  MglNavigationControl,
  MglScaleControl,
  MglGeolocationControl,
} from 'vue-maplibre-gl';
import {
  Map,
  type GeoJSONSource,
  type LngLatLike,
  type MapMouseEvent,
  type MapSourceDataEvent,
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

const map = ref<Map>();
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
const selectedFeature = ref<PointFeature>();
const selectedResponseNumber = ref(-1);
const clusterCount = ref(0);

const selectedResponses = computed(() => {
  const responseNumbers = selectedFeature.value?.properties.all_responses;

  if (!responseNumbers) return [];

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
 * Centre the map on the selected response when it changes
 */
watch(selectedResponseNumber, () => {
  if (!map.value || !selectedFeature.value) return;

  introOpen.value = false;

  map.value.easeTo({
    center: selectedFeature.value.geometry.coordinates as LngLatLike,
    padding: { left: sidePanelRef.value?.offsetWidth || 0 },
  });
});

/**
 * Whenever the hash or cluster count changes check. The selected feature can
 * change even if the response number doesn't, because at different zooms levels
 * the response is part of different clusters
 * feature
 */
watchEffect(() => {
  if (!map.value || !route.hash.startsWith(HASH_PREFIX)) {
    selectedFeature.value = undefined;
    selectedResponseNumber.value = -1;
    return;
  }

  // We need to trigger this watcher when the cluster count changes as this
  // indicates that the map has been zoomed in or out, but we don't actually
  // need the value
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  clusterCount.value;

  const responseNumber = Number(route.hash.slice(HASH_PREFIX.length));

  const feature = map.value.queryRenderedFeatures({
    layers: ['unclustered-points', 'clusters'],
    filter: ['in', `<${responseNumber}>`, ['get', 'all_responses']],
  })[0] as unknown as PointFeature | undefined;

  // Only update selectedFeature if it has changed, as queryRenderedFeature
  // doesn't have stable object references
  if (
    feature?.properties.all_responses !==
    selectedFeature.value?.properties.all_responses
  ) {
    selectedFeature.value = feature;
  }

  // This should really be a computed property on the route hash, but we need to
  // respond to it after the selected feature has been updated
  selectedResponseNumber.value = responseNumber;
});

/**
 * Handle zoom events. This just keeps track of the number of clusters on the
 * map so we can identify when the clusters are reclustered
 * https://stackoverflow.com/questions/58768283/detect-when-map-reclusters-features
 */
function handleZoom() {
  if (!map.value) return;

  const clusters = map.value.queryRenderedFeatures({ layers: ['clusters'] });
  clusterCount.value = clusters.length;
}

/**
 * Handle clicking on the map to add a new response. This will set the new response
 * address and geocode it to get a formatted address
 *
 * @param e The click event
 */
async function handleAddClick(event: MapMouseEvent) {
  const mapSchema = props.callout.responseViewSchema?.map;
  if (!map.value || !mapSchema) return; // Can't actually happen

  const coords = event.lngLat;
  map.value.getCanvas().style.cursor = '';

  map.value.easeTo({
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
function handleClusterClick(cluster: ClusterFeature) {
  const mapSchema = props.callout.responseViewSchema?.map;
  if (!map.value || !mapSchema) return; // Can't actually happen

  const source = map.value.getSource('responses') as GeoJSONSource;
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
      map.value!.easeTo({
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
function handleClick(e: { event: MapMouseEvent }) {
  if (!map.value) return;

  if (isAddMode.value) {
    if (!newResponseAnswers.value) {
      handleAddClick(e.event);
    }
  } else {
    const [point] = map.value.queryRenderedFeatures(e.event.point, {
      layers: ['clusters', 'unclustered-points'],
    });

    if (point?.layer.id === 'clusters') {
      handleClusterClick(point as unknown as ClusterFeature);
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

/**
 * Handle map load. Attach a listener to wait until the source data is loaded.
 * Add a geocoding control to the map if a key is available
 *
 * @param e The map load event
 */
function handleLoad({ map: mapInstance }: { map: Map }) {
  function handleSourceData(sourceDataEvent: MapSourceDataEvent) {
    if (
      sourceDataEvent.sourceId === 'responses' &&
      sourceDataEvent.isSourceLoaded
    ) {
      // Only set the map reference when responses are loaded. This means other
      // watchers can rely on the map being loaded
      map.value = mapInstance;
      mapInstance.off('sourcedata', handleSourceData);
    }
  }

  mapInstance.on('sourcedata', handleSourceData);

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

    mapInstance.addControl(geocodeControl, 'top-left');
  }
}

// Start add response mode
function handleStartAddMode() {
  router.push({ ...route, hash: '#add' });
}

// Cancel add response mode, clearing any state that is left over
function handleCancelAddMode() {
  router.push({ ...route, hash: '' });
}

// Toggle add mode
watch(isAddMode, (v) => {
  if (!map.value) return;
  if (v) {
    introOpen.value = false;
    map.value.getCanvas().style.cursor = 'crosshair';
  } else {
    newResponseAnswers.value = undefined;
    map.value.getCanvas().style.cursor = '';
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
