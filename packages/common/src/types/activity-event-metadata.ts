import type { ActivityEventType, ContributionPeriod } from '../data/index.js';
import type { ContactOriginData, RoleType } from './index.js';

export interface ContributionUpdateData {
  startNow: boolean;
  expiryDate: Date;
  form: {
    monthlyAmount: number;
    period: ContributionPeriod;
    payFee: boolean;
    prorate: boolean;
  };
}

export interface ActivityEventMetadataMap {
  [ActivityEventType.CalloutAnswered]: { responseId: string };
  [ActivityEventType.ContactCreated]: ContactOriginData;
  [ActivityEventType.ContactContributionStarted]: ContributionUpdateData;
  [ActivityEventType.ContactContributionUpdated]: ContributionUpdateData;
  [ActivityEventType.ContactRoleAdded]: { roleType: RoleType };
  [ActivityEventType.EmailSent]: { email: string; recipient: string };
  [ActivityEventType.EmailTemplateAdded]: { templateId: string | null };
}

/**
 * The metadata for a given activity event type, or never if it carries none
 */
export type ActivityEventMetadata<T extends ActivityEventType> =
  T extends keyof ActivityEventMetadataMap
    ? ActivityEventMetadataMap[T]
    : never;
