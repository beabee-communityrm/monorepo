import type { ItemStatus } from '@beabee/beabee-common';
import type { CalloutData } from '@type';

export interface GetCalloutData extends CalloutData {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  status: ItemStatus;
}
