import { CalloutMapSchemaIconStyling } from './callout-map-schema-icon-styling';

export interface CalloutMapSchema {
  style: string;
  center: [number, number];
  bounds: [[number, number], [number, number]];
  minZoom: number;
  maxZoom: number;
  initialZoom: number;
  addressProp: string;
  addressPattern: string;
  addressPatternProp: string;
  /**
   * Restricts geocoding search results to specific countries. This configuration parameter
   * can be set through the admin interface and is passed to the MapTiler GeocodingControl
   * to limit search results to the specified countries.
   */
  geocodeCountries?: string;
  mapIconProp?: string;
  mapIconStyling?: CalloutMapSchemaIconStyling;
}
