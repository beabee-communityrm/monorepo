import type { GeocodingFeature } from '@maptiler/client';

export interface GeocodePickEvent extends Event {
  detail: GeocodingFeature | null;
}
