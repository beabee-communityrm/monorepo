export interface mapIconStylingSchema {
  answer: string;
  color: string;
  icon: string;
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
  mapIconStyling?: mapIconStylingSchema[];
}
