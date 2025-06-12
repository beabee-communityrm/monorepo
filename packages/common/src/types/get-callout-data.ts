import type { ItemStatus } from '../data/index.js';
import type { CalloutData } from './index.js';

export interface GetCalloutData extends CalloutData {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  status: ItemStatus;
}
