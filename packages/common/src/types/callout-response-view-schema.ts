import type { CalloutMapSchema } from './index.js';

export interface CalloutResponseViewSchema {
  buckets: string[];
  titleProp: string;
  imageProp: string;
  imageFilter: string;
  links: { text: string; url: string }[];
  gallery: boolean;
  map: CalloutMapSchema | null;
}
