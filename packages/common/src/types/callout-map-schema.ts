export interface MapIconDefinition {
  prefix: string;
  name: string;
}

export interface MapIconStyle {
  question: string;
  answer: string;
  color: string;
  icon: MapIconDefinition;
}

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
  geocodeCountries?: string;
  mapIconProp?: string;
  mapIconStyling?: MapIconStyle[];
}
