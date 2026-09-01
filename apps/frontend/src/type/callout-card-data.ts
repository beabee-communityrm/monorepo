import type { GetCalloutData } from '@beabee/beabee-common';

/**
 * A callout optionally enriched with the `hasAnswered`/`responseCount` `with`s
 * used by the callout card/row components.
 */
export interface CalloutCardData extends GetCalloutData {
  hasAnswered?: boolean;
  responseCount?: number;
}
