import type {
  ContributionPeriod,
  ContributionType,
  MembershipStatus,
} from '../data/index.js';
import type { PaymentSource } from './index.js';

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
