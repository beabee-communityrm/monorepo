<template>
  <CalloutPreviewCard
    icon="i-lucide-map-pin"
    :title="t('callout.mapPreview.title')"
    :view-all-to="mapTo"
    :view-all-label="t('callout.mapPreview.viewFullMap')"
  >
    <MglMap
      style="height: 150px"
      :map-style="mapStyle"
      :center="[0, 0]"
      :zoom="1"
      :interactive="false"
      :attribution-control="false"
      @map:load="handleLoad"
    >
      <MglGeoJsonSource source-id="preview-points" :data="pointsCollection">
        <MglCircleLayer
          layer-id="preview-points-circles"
          :paint="{
            'circle-color': 'black',
            'circle-radius': 6,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff',
          }"
        />
      </MglGeoJsonSource>
    </MglMap>
  </CalloutPreviewCard>
</template>

<script lang="ts" setup>
import 'maplibre-gl/dist/maplibre-gl.css';
import 'vue-maplibre-gl/dist/vue-maplibre-gl.css';

import { computed } from 'vue';
import { MglCircleLayer, MglGeoJsonSource, MglMap } from 'vue-maplibre-gl';
import { useI18n } from 'vue-i18n';
import type { RouteLocationRaw } from 'vue-router';

import CalloutPreviewCard from '#components/callout/CalloutPreviewCard.vue';

const { t } = useI18n();

/** Props for CalloutMapPreview */
export interface CalloutMapPreviewProps {
  /** Link to the full map page */
  mapTo: RouteLocationRaw;
  /** The MapLibre style URL, from callout.responseViewSchema.map.style */
  mapStyle: string;
  /** Response locations to plot */
  points: { lat: number; lng: number }[];
}

const props = defineProps<CalloutMapPreviewProps>();

const pointsCollection = computed(() => ({
  type: 'FeatureCollection' as const,
  features: props.points.map((point) => ({
    type: 'Feature' as const,
    geometry: { type: 'Point' as const, coordinates: [point.lng, point.lat] },
    properties: {},
  })),
}));

function handleLoad({ map }: { map: import('maplibre-gl').Map }) {
  if (props.points.length === 0) return;

  if (props.points.length === 1) {
    map.setCenter([props.points[0].lng, props.points[0].lat]);
    map.setZoom(12);
    return;
  }

  const lngs = props.points.map((p) => p.lng);
  const lats = props.points.map((p) => p.lat);
  map.fitBounds(
    [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)],
    ],
    { padding: 24, duration: 0 }
  );
}
</script>
