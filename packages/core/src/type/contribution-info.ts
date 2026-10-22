import {
  ContributionPeriod,
  ContributionType,
  MembershipStatus,
  PaymentSource,
} from '@beabee/beabee-common';

export interface ContributionInfo {
  type: ContributionType;
  amount?: number;
  nextAmount?: number;
  /** The next amount waits for a payment to be authenticated */
  nextAmountPending?: boolean;
  period?: ContributionPeriod;
  cancellationDate?: Date;
  renewalDate?: Date;
  paymentSource?: PaymentSource;
  payFee?: boolean;
  hasPendingPayment?: boolean;
  membershipStatus: MembershipStatus;
  membershipExpiryDate?: Date;
}
