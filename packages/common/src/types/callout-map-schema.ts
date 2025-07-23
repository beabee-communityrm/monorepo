export interface CalloutMapIconDefinition {
  prefix: string;
  name: string;
}

export interface CalloutMapIconStyle {
  question: string;
  answer: string;
  color: string;
  icon: CalloutMapIconDefinition;
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
  mapIconStyling?: CalloutMapIconStyle[];
}
