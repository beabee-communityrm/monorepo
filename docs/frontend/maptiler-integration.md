# MapTiler Integration in Frontend

## Overview

MapTiler integration provides interactive mapping capabilities and address geocoding functionality in the Beabee frontend application.

## Configuration

### Environment Variables

```bash
BEABEE_MAPTILER_KEY=your_maptiler_api_key_here
```

### Client Setup

```typescript:apps/frontend/src/lib/maptiler.ts
import { config, geocoding } from '@maptiler/client';
import env from '../env';

config.apiKey = env.maptilerKey;
export { geocoding };
```

## Map Click to Address Flow

### 1. Add Mode Activation

```typescript
function handleStartAddMode() {
  router.push({ ...route, hash: "#add" });
}
```

### 2. Map Click Handling

```typescript:apps/frontend/src/pages/crowdnewsroom/[id]/map.vue
async function handleAddClick(event: MapMouseEvent) {
  const mapSchema = props.callout.responseViewSchema?.map;
  if (!map.value || !mapSchema) return;

  const coords = event.lngLat;
  const geocodeResult = await reverseGeocode(coords.lat, coords.lng);

  const address: GeocodeResult = {
    formatted_address: geocodeResult?.formatted_address || '???',
    features: geocodeResult?.features || [],
    geometry: { location: coords },
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
```

### 3. Reverse Geocoding

```typescript:apps/frontend/src/utils/geocode.ts
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<GeocodeResult | undefined> {
  if (!env.maptilerKey) return undefined;

  const data = await geocoding.reverse([lng, lat], {
    language: currentLocaleConfig.value.baseLocale,
    types: ['address', 'postal_code', 'municipality', 'county', 'region'],
  });

  if (!data.features.length) return undefined;

  const result: GeocodeResult = {
    ...featureToAddress(data.features[0]),
    features: data.features.map((feature) => ({
      text: feature.text,
      types: feature.place_type,
    })),
  };

  const addressFeature = data.features.find((f) =>
    f.place_type.includes('address')
  );

  if (addressFeature?.address) {
    result.features.push({
      text: addressFeature.address,
      types: ['street_number'],
    });
  }

  return result;
}
```

## Address Provider Integration

The MapTiler integration includes a Form.io address provider that is automatically configured - no manual setup required.

## Geocoding Control

```typescript:apps/frontend/src/pages/crowdnewsroom/[id]/map.vue
if (env.maptilerKey) {
  const geocodeControl = new GeocodingControl({
    apiKey: env.maptilerKey,
    language: currentLocaleConfig.value.baseLocale,
    proximity: [{ type: 'map-center' }],
    country: props.callout.responseViewSchema?.map?.geocodeCountries,
  });

  geocodeControl.addEventListener('pick', (e: Event) => {
    const event = e as GeocodePickEvent;
    geocodeAddress.value = event.detail
      ? featureToAddress(event.detail)
      : undefined;
  });

  mapInstance.addControl(geocodeControl, 'top-left');
}
```

## Key Files

- `apps/frontend/src/lib/maptiler.ts` - MapTiler client configuration
- `apps/frontend/src/utils/geocode.ts` - Geocoding utility functions
- `apps/frontend/src/pages/crowdnewsroom/[id]/map.vue` - Main map component
- `apps/frontend/src/lib/formio/providers/address/MapTilerAddressProvider.ts` - Form.io address provider
