import type { Brackets } from 'typeorm';

export interface TestUserFilters {
  isActive: Brackets;
  isInactive: Brackets;
  isSuperAdmin: Brackets;
  isGift: Brackets;
  hasSubscription: Brackets;
  hasCancelled: Brackets;
  isPayingFee: Brackets;
  noScheduledPayments: Brackets;
  hasScheduledPayments: Brackets;
  noFailedPayments: Brackets;
  hasFailedPayments: Brackets;
}
