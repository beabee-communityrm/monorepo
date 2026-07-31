import type {
  CalloutResponseViewSchema,
  GetCalloutData,
} from '@beabee/beabee-common';

/**
 * A callout optionally enriched with the `hasAnswered`/`responseCount`/
 * `responseViewSchema` `with`s used by the callout card/row components.
 */
export interface CalloutCardData extends GetCalloutData {
  hasAnswered?: boolean;
  responseCount?: number;
  responseViewSchema?: CalloutResponseViewSchema | null;
}
