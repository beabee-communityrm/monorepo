/**
 * @constant
 * @name MILLISECONDS_IN_HOUR
 * @summary Milliseconds in 1 hour
 */
export const MILLISECONDS_IN_HOUR: number = 3600000;

/**
 * @constant
 * @name MILLISECONDS_IN_MINUTE
 * @summary Milliseconds in 1 minute
 */
export const MILLISECONDS_IN_MINUTE: number = 60000;

/**
 * @constant
 * @name MAX_FILE_SIZE_IN_BYTES
 * @summary Maximum file size in bytes
 */
export const MAX_FILE_SIZE_IN_BYTES: number = 20 * 1024 * 1024; // 20 MB = 20.971.520 bytes

/**
 * A list of all image formats that are supported by the sharp-module and our ImageService
 * @constant
 * @name ALLOWED_IMAGE_EXTENSIONS
 * @summary Allowed image formats for upload (input formats)
 */
export const ALLOWED_IMAGE_EXTENSIONS: string[] = [
  'jpeg',
  'jpg',
  'png',
  'webp',
  'gif',
  'avif',
  'svg', // SVG vector graphics
  'tiff',
  'tif', // TIFF-Formate
  'heif',
  'heic', // High Efficiency Image Format (Apple Photos)
  'jp2', // JPEG 2000
];

/**
 * A list of all MIME types that are supported by the sharp-module and our ImageService
 * @constant
 * @name ALLOWED_IMAGE_MIME_TYPES
 * @summary Allowed MIME types
 */
export const ALLOWED_IMAGE_MIME_TYPES: string[] = [
  'image/jpeg',
  'image/jpg', // Fallback for JPEG which is not standardized
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml', // SVG is supported, also for scaling and converting
  'image/tiff', // TIFF is supported by the sharp-module
  'image/heif', // HEIF/HEIC for High Efficiency Image Format
  'image/jp2', // JPEG 2000
];

/**
 * A list of all document formats that are supported by our DocumentService
 * @constant
 * @name ALLOWED_DOCUMENT_EXTENSIONS
 * @summary Allowed document formats for upload (input formats)
 */
export const ALLOWED_DOCUMENT_EXTENSIONS: string[] = ['pdf'];

/**
 * A list of all MIME types that are supported by our DocumentService
 * @constant
 * @name ALLOWED_DOCUMENT_MIME_TYPES
 * @summary Allowed MIME types
 */
export const ALLOWED_DOCUMENT_MIME_TYPES: string[] = ['application/pdf'];

/**
 * Address component types for standardized parsing and placeholder replacement / formatting
 * Based on the MapTiler types, check `GeocodingPlaceType` in `@maptiler/client` for more possible types
 */
export enum ADDRESS_COMPONENT_TYPE {
  /** Street number, e.g. "90" */
  STREET_NUMBER = 'street_number',
  /** Street name, e.g. "Hermannstraße" */
  ADDRESS = 'address',
  /** Municipality, e.g. "Berlin" */
  MUNICIPALITY = 'municipality',
  /** Locality, e.g. "Mitte" in Berlin */
  LOCALITY = 'locality',
  /** Region, e.g. "Berlin" */
  REGION = 'region',
  /** Postal code, e.g. "12051" */
  POSTAL_CODE = 'postal_code',
  /** Country, e.g. "Germany" */
  COUNTRY = 'country',
  /** Subregion, e.g. "Nordrhein" in Nordrhein-Westfalen */
  SUBREGION = 'subregion',
  /** County, e.g. "Cuxhaven" */
  COUNTY = 'county',
  /** Joint municipality, e.g. "Samtgemeinde" */
  JOINT_MUNICIPALITY = 'joint_municipality',
  /** Municipal district, e.g. "Mitte" in Berlin */
  MUNICIPAL_DISTRICT = 'municipal_district',
  /** Neighbourhood, e.g. "Kreuzberg" in Berlin */
  NEIGHBOURHOOD = 'neighbourhood',
  /** Named place, e.g. "Brandenburger Tor" */
  PLACE = 'place',
}
