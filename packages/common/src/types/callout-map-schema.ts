export interface IconDefinition {
  prefix: string;
  name: string;
}

export interface IconStyles {
  question: string;
  answer: string;
  color: string;
  icon: IconDefinition;
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
  mapIconQuestion?: string;
  mapIconStyling?: IconStyles[];
}
