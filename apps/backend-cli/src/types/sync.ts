import type { Payment } from '@beabee/core/models';
import type { PaymentData } from '@beabee/core/type';

import {
  SYNC_NEWSLETTER_RECONCILE_TESTS,
  SYNC_PAYMENT_SERVICE_RECONCILE_TESTS,
} from '../constants/sync.js';

export interface SyncNewsletterActiveMemberTagArgs {
  since: Date;
  until: Date;
  danger: boolean;
}

export type SyncNewsletterReconcileTestId =
  (typeof SYNC_NEWSLETTER_RECONCILE_TESTS)[number];

export interface SyncNewsletterReconcileArgs {
  danger: boolean;
  report: boolean;
  importNew: boolean;
  uploadNew: boolean;
  fix: SyncNewsletterReconcileTestId[];
  since: Date | undefined;
  until: Date | undefined;
}

export interface SyncDangerArgs {
  danger: boolean;
}

export interface SyncSegmentsArgs {
  segmentId: string;
  danger: boolean;
}

export interface SyncContactSyncServicePushArgs {
  contactIds: string[] | undefined;
  danger: boolean;
}

export type SyncPaymentServiceReconcileTestId =
  (typeof SYNC_PAYMENT_SERVICE_RECONCILE_TESTS)[number];

export interface SyncPaymentServiceReconcileArgs {
  danger: boolean;
  report: boolean;
  contactIds: string[] | undefined;
  fix: SyncPaymentServiceReconcileTestId[];
  since: Date | undefined;
  until: Date | undefined;
}

/** A local payment as far as the reconciliation reads it */
export type LocalPayment = Pick<Payment, 'id'> & PaymentData;

/** A local payment that differs from the payment provider's in the given fields */
export interface PaymentMismatch {
  payment: LocalPayment;
  data: PaymentData;
  fields: (keyof PaymentData)[];
}

/** A payment provider's payment of a known contact without a local payment */
export interface MissingPayment {
  id: string;
  contactId: string;
  data: PaymentData;
}

export interface PaymentReconciliation {
  mismatches: PaymentMismatch[];
  missing: MissingPayment[];
  /** Local payments the payment provider no longer has */
  orphans: LocalPayment[];
}
