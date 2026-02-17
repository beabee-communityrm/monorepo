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
        :center="currentPosition.center"
        :zoom="currentPosition.zoom"
        :map-style="callout.responseViewSchema.map.style"
        :max-zoom="callout.responseViewSchema.map.maxZoom"
        :min-zoom="callout.responseViewSchema.map.minZoom"
        :max-bounds="callout.responseViewSchema.map.bounds"
        :language="currentLocaleConfig.baseLocale"
        @map:load="handleLoad"
        @map:click="handleClick"
        @map:mousemove="handleMouseOver"
        @map:zoom="handleZoom"
        @map:moveend="handlePositionChange"
        @map:zoomend="handlePositionChange"
      >
        <MglNavigationControl />
        <MglScaleControl />
        <MglGeolocationControl />

        <MglGeoJsonSource
          :source-id="SOURCE_IDS.RESPONSES"
          :data="responsesCollecton"
          cluster
          :cluster-properties="{
            all_responses: ['concat', ['get', 'all_responses']],
            first_response: ['min', ['get', 'first_response']],
          }"
        >
          <MglCircleLayer
            :layer-id="LAYER_IDS.CLUSTERS"
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
          <MglSymbolLayer
            v-if="mapLoaded"
            :layer-id="LAYER_IDS.UNCLUSTERED_POINTS"
            :filter="['!', ['has', 'point_count']]"
            :layout="{
              'icon-image': ['get', 'icon'],
              'icon-size': 1,
            }"
          />
        </MglGeoJsonSource>
        <MglGeoJsonSource
          v-if="selectedFeature"
          :source-id="SOURCE_IDS.SELECTED_RESPONSE"
          :data="selectedFeature"
        >
          <MglCircleLayer
            :layer-id="LAYER_IDS.SELECTED_RESPONSE"
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
          v-if="isAddMode && !newResponseAddress"
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
      v-if="showAddButton && !isAddMode && isEmbed"
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
          v-if="showAddButton"
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
      :show="showIntroPanel"
      @close="showIntroPanel = false"
    />

    <CalloutAddResponsePanel
      :callout="callout"
      :answers="
        isAddMode && newResponseAddress ? newResponseAnswers : undefined
      "
      @close="handleCancelAddMode"
    />
  </div>
</template>

<script lang="ts" setup>
import {
  type CalloutMapSchemaIconStylingAnswerIcon,
  type CalloutResponseAnswerAddress,
  type CalloutResponseAnswersSlide,
  type GetCalloutDataWith,
  getByPath,
  isLngLat,
} from '@beabee/beabee-common';
import { fetchAllPages } from '@beabee/client';
import { AppButton } from '@beabee/vue';
import { library } from '@beabee/vue/plugins/icons';

import { faInfoCircle, faPlus, fas } from '@fortawesome/free-solid-svg-icons';
import { GeocodingControl } from '@maptiler/geocoding-control/maplibregl';
import '@maptiler/geocoding-control/style.css';
import {
  type GeoJSONSource,
  type LngLatLike,
  Map,
  type MapMouseEvent,
  type MapSourceDataEvent,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  computed,
  onBeforeMount,
  onMounted,
  ref,
  toRef,
  watch,
  watchEffect,
} from 'vue';
import { useI18n } from 'vue-i18n';
import {
  MglCircleLayer,
  MglGeoJsonSource,
  MglGeolocationControl,
  MglMap,
  MglMarker,
  MglNavigationControl,
  MglScaleControl,
  MglSymbolLayer,
} from 'vue-maplibre-gl';
import 'vue-maplibre-gl/dist/vue-maplibre-gl.css';
import { useRoute, useRouter } from 'vue-router';

import CalloutAddResponsePanel from '#components/pages/callouts/CalloutAddResponsePanel.vue';
import CalloutIntroPanel from '#components/pages/callouts/CalloutIntroPanel.vue';
import CalloutMapHeader from '#components/pages/callouts/CalloutMapHeader.vue';
import CalloutShowResponsePanel from '#components/pages/callouts/CalloutShowResponsePanel.vue';
import {
  HASH_PREFIX,
  useCallout,
} from '#components/pages/callouts/use-callout';
import { currentLocaleConfig } from '#lib/i18n';
import { isEmbed } from '#store';
import type {
  GeocodePickEvent,
  GetCalloutResponseMapDataWithAddress,
  MapClusterFeature,
  MapPointFeature,
  MapPointFeatureCollection,
} from '#type';
import {
  generateImageId,
  getImageString,
  loadImageFromDataURLToMap,
  setKey,
  svgToDataURL,
} from '#utils';
import { client } from '#utils/api';
import {
  type GeocodeResult,
  featureToAddress,
  formatGeocodeResult,
  reverseGeocode,
} from '#utils/geocode';

import env from '../../../env';

const LAYER_IDS = {
  CLUSTERS: 'clusters',
  UNCLUSTERED_POINTS: 'unclustered-points',
  SELECTED_RESPONSE: 'selected-response',
} as const;

const SOURCE_IDS = {
  RESPONSES: 'responses',
  SELECTED_RESPONSE: 'selected-response',
} as const;

const props = defineProps<{
  callout: GetCalloutDataWith<'form' | 'responseViewSchema' | 'variantNames'>;
}>();

const map = ref<Map>();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const mapLoaded = ref(false);

const currentPosition = computed({
  get: () => {
    let center = props.callout.responseViewSchema?.map?.center;
    if (route.query.c) {
      const newCenter = route.query.c.toString().split(',').map(Number);
      if (isLngLat(newCenter)) {
        center = newCenter;
      }
    }

    let zoom = props.callout.responseViewSchema?.map?.initialZoom;
    if (route.query.z) {
      const newZoom = Number(route.query.z);
      if (!isNaN(newZoom)) {
        zoom = newZoom;
      }
    }

    return { center, zoom };
  },
  set: (position) => {
    router.replace({
      ...route,
      query: {
        ...route.query,
        c: position.center?.map((n) => n.toFixed(5)).join(','),
        z: position.zoom?.toFixed(3),
      },
    });
  },
});

// The list of responses for this callout
const responses = ref<GetCalloutResponseMapDataWithAddress[]>([]);
const responsesByNumber = computed(() =>
  responses.value.reduce(
    (acc, r) => {
      acc[r.number] = r;
      return acc;
    },
    {} as Record<number, GetCalloutResponseMapDataWithAddress>
  )
);

// Used to adjust map view based on the side panel width
const sidePanelRef = ref<HTMLElement>();

const showIntroPanel = ref(false);
const { isOpen } = useCallout(toRef(props, 'callout'));
const isAddMode = computed(() => route.hash === '#add');

const showAddButton = computed(
  () => isOpen.value && route.query.noadd === undefined
);

const newResponseAnswers = ref(
  route.query.answers
    ? (JSON.parse(
        route.query.answers.toString()
      ) as CalloutResponseAnswersSlide)
    : undefined
);

// Use the geocoding address to show a marker on the map
const geocodeAddress = ref<CalloutResponseAnswerAddress>();

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

const mapIconProp = computed(() => {
  return props.callout.responseViewSchema?.map?.mapIconProp || '';
});

const mapIconStyling = computed(() => {
  return (
    props.callout.responseViewSchema?.map?.mapIconStyling?.[
      mapIconProp.value
    ] || {}
  );
});

/**
 * Get the icon styling for the given answers, based on the map icon question / category answer
 *
 * @param answers The answers for the callout response
 * @returns The icon styling schema, or undefined if no matching styling is found
 */
function getIconStyling(
  answers: CalloutResponseAnswersSlide
): CalloutMapSchemaIconStylingAnswerIcon | undefined {
  const key = mapIconProp.value;
  if (!key) return undefined;
  const answer = getByPath(answers, key);
  // We do not allow multiple answers for the map icon prop, so we can safely assume it's a string
  if (!answer || typeof answer !== 'string') return undefined;
  return mapIconStyling.value?.[answer];
}

// A GeoJSON FeatureCollection of all the responses
const responsesCollecton = computed<MapPointFeatureCollection>(() => {
  return {
    type: 'FeatureCollection',
    features: responses.value.map((response) => {
      const { lat, lng } = response.address.geometry.location;
      const iconName = getIconStyling(response.answers)?.icon.name || 'circle';
      const color = getIconStyling(response.answers)?.color || 'black';

      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties: {
          all_responses: `<${response.number}>`,
          first_response: response.number,
          icon: generateImageId(iconName, color),
        },
      };
    }),
  };
});

// The selected response or cluster GeoJSON Feature
const selectedFeature = ref<MapPointFeature>();
// The selected response number (from the hash)
const selectedResponseNumber = ref(-1);
// The number of clusters in view. Just used to detect when the clusters are reclustered
const clusterCount = ref(0);

// The responses that are part of the selected cluster or point
const selectedResponses = computed(() => {
  const selectedFeatureResponses =
    selectedFeature.value?.properties.all_responses;

  if (!selectedFeatureResponses) return [];

  const responseNumbers = selectedFeatureResponses
    // Remove first < and last >
    .substring(1, selectedFeatureResponses.length - 1)
    // Split each response number
    .split('><')
    .map(Number)
    .sort();

  return responseNumbers.map((r) => responsesByNumber.value[r]);
});

/**
 * Find the cluster or point that corresponds to the selected response number
 *
 * @param responseNo The response number
 */
function findSelectedFeature(responseNo: number) {
  if (!map.value) return;

  const feature = map.value.queryRenderedFeatures({
    layers: [LAYER_IDS.UNCLUSTERED_POINTS, LAYER_IDS.CLUSTERS],
    filter: ['in', `<${responseNo}>`, ['get', 'all_responses']],
  })[0] as unknown as MapPointFeature | undefined;

  if (
    // If feature wasn't found, it probably just isn't in the map's viewport,
    // don't clear the selected feature
    feature &&
    // Only update selectedFeature if it has changed, as queryRenderedFeature
    // doesn't have stable object references
    feature.properties.all_responses !==
      selectedFeature.value?.properties.all_responses
  ) {
    selectedFeature.value = feature;
  }
}

/**
 * Whenever the hash or cluster count changes check. The selected feature can
 * change even if the response number doesn't, because at different zooms levels
 * the response is part of different clusters
 * feature
 */
watchEffect(() => {
  if (!map.value) return;

  // Force cluster count to be a dependency
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  clusterCount.value;

  // This can't be a computed because we need to also compute the value of selectedFeature
  // in the same event loop, so they are both available to the next watcher
  selectedResponseNumber.value = route.hash.startsWith(HASH_PREFIX)
    ? Number(route.hash.slice(HASH_PREFIX.length))
    : -1;

  if (selectedResponseNumber.value === -1) {
    selectedFeature.value = undefined;
  } else {
    findSelectedFeature(selectedResponseNumber.value);
  }
});

/**
 * Centre the map on the selected response
 */
watch(selectedResponseNumber, (responseNo) => {
  if (!map.value) return;

  showIntroPanel.value = false;

  let center: LngLatLike | undefined;

  if (selectedFeature.value) {
    center = selectedFeature.value.geometry.coordinates as LngLatLike;
  } else {
    // It could be that the response isn't in a visible cluster, so hasn't been
    // found by queryRenderedFeatures. If this is the case then move to
    // where the response is, then look again for the response once it's in view
    const response = responsesByNumber.value[responseNo];
    if (response) {
      center = [
        response.address.geometry.location.lng,
        response.address.geometry.location.lat,
      ];
      map.value.once('moveend', () => findSelectedFeature(responseNo));
    }
  }

  if (center) {
    map.value.easeTo({
      center,
      padding: { left: sidePanelRef.value?.offsetWidth || 0 },
    });
  }
});

/**
 * Handle move and zoom end events. This updates the current center and zoom
 * query parameters
 */
function handlePositionChange() {
  if (!map.value) return;

  const { lat, lng } = map.value.getCenter();
  currentPosition.value = {
    center: [lng, lat],
    zoom: map.value.getZoom(),
  };
}

/**
 * Handle zoom events. This just keeps track of the number of clusters on the
 * map so we can identify when the clusters are reclustered
 * https://stackoverflow.com/questions/58768283/detect-when-map-reclusters-features
 */
function handleZoom() {
  if (!map.value) return;

  const clusters = map.value.queryRenderedFeatures({
    layers: [LAYER_IDS.CLUSTERS],
  });
  clusterCount.value = clusters.length;
}

/**
 * Handle clicking on the map to add a new response. This will set the new response
 * address and geocode it to get a formatted address
 *
 * @param event The click event
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

  const responseAnswers: CalloutResponseAnswersSlide = newResponseAnswers.value
    ? (JSON.parse(
        JSON.stringify(newResponseAnswers.value)
      ) as CalloutResponseAnswersSlide)
    : {};
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
function handleClusterClick(cluster: MapClusterFeature) {
  const mapSchema = props.callout.responseViewSchema?.map;
  if (!map.value || !mapSchema) return; // Can't actually happen

  const source = map.value.getSource(SOURCE_IDS.RESPONSES) as GeoJSONSource;
  source.getClusterExpansionZoom(cluster.properties.cluster_id, (err, zoom) => {
    if (err || zoom == null) {
      // eslint-disable-next-line no-console
      console.error('Failed to get cluster expansion zoom:', err);
      return;
    }

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
    if (!newResponseAddress.value) {
      handleAddClick(e.event);
    }
  } else {
    const [point] = map.value.queryRenderedFeatures(e.event.point, {
      layers: [LAYER_IDS.CLUSTERS, LAYER_IDS.UNCLUSTERED_POINTS],
    });

    if (point?.layer.id === LAYER_IDS.CLUSTERS) {
      handleClusterClick(point as unknown as MapClusterFeature);
    } else {
      // Open the response or clear the hash
      router.push({
        ...route,
        hash: point ? HASH_PREFIX + point.properties.first_response : '',
      });
    }
  }
}

/**
 * Add a cursor when hovering over a cluster or a point
 * @param e The mouse over event
 */
function handleMouseOver(e: { event: MapMouseEvent }) {
  if (!map.value || isAddMode.value) return;

  const features = map.value.queryRenderedFeatures(e.event.point, {
    layers: [LAYER_IDS.CLUSTERS, LAYER_IDS.UNCLUSTERED_POINTS],
  });

  map.value.getCanvas().style.cursor = features.length > 0 ? 'pointer' : '';
}

/**
 * Handle map load. Attach a listener to wait until the source data is loaded.
 * Add a geocoding control to the map if a key is available
 *
 * @param e The map load event
 */
async function handleLoad({ map: mapInstance }: { map: Map }) {
  /**
   * Check if the responses source data is loaded
   * @param sourceDataEvent The source data event
   */
  function handleSourceData(sourceDataEvent: MapSourceDataEvent) {
    if (
      sourceDataEvent.sourceId === SOURCE_IDS.RESPONSES &&
      sourceDataEvent.isSourceLoaded
    ) {
      // Only set the map reference when responses are loaded. This means other
      // watchers can rely on the map and map data both being loaded
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

  // Dynamically collect unique icon names and colors, always including defaults
  const iconNames = new Set<string>(
    Object.keys(mapIconStyling.value).map(
      (key) => mapIconStyling.value?.[key]?.icon.name || 'circle'
    )
  );

  const iconColors = new Set<string>(
    Object.keys(mapIconStyling.value).map(
      (key) => mapIconStyling.value?.[key]?.color || 'black'
    )
  );

  // Add default icon and color
  iconNames.add('circle');
  iconColors.add('black');

  for (const iconName of iconNames) {
    for (const color of iconColors) {
      const svgString = getImageString(iconName, color);

      const pngDataUrl = await svgToDataURL(svgString);

      const image = await loadImageFromDataURLToMap(mapInstance, pngDataUrl);

      if (image) {
        mapInstance.addImage(generateImageId(iconName, color), image);
      }
    }
  }
  mapLoaded.value = true;
}

/**
 * Start add response mode
 */
function handleStartAddMode() {
  router.push({ ...route, hash: '#add' });
}

/**
 * Cancel add response mode, clearing any state that is left over
 */
function handleCancelAddMode() {
  router.push({ ...route, hash: '' });
}

/**
 * Toggle the cursor when entering add mode
 */
watch(isAddMode, (v) => {
  if (!map.value) return;
  if (v) {
    showIntroPanel.value = false;
    map.value.getCanvas().style.cursor = 'crosshair';
  } else {
    if (route.query.answers) {
      try {
        newResponseAnswers.value = JSON.parse(
          route.query.answers.toString()
        ) as CalloutResponseAnswersSlide;
      } catch {
        newResponseAnswers.value = undefined;
      }
    }
    map.value.getCanvas().style.cursor = '';
  }
});

/**
 * Load callout and responses
 */
onBeforeMount(async () => {
  if (!props.callout.responseViewSchema?.map) {
    throw new Error('Callout does not have a map schema');
  }

  responses.value = await fetchAllPages(
    client.callout.listResponsesForMap.bind(client.callout, props.callout.slug),
    1000
  ).then((items) =>
    items.filter((r): r is GetCalloutResponseMapDataWithAddress => !!r.address)
  );
});

onMounted(async () => {
  // intro panel is shown by default, but not in some cases (e.g. when
  // switching from the gallery view)
  if (!route.query.noIntro) {
    showIntroPanel.value = true;
  }
});

onBeforeMount(() =>
  // we need to preload all solid icons because we do not know
  // which icon will be returned by the icon search
  library.add(fas)
);
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
