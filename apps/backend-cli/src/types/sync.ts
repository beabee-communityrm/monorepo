import type { Payment } from '@beabee/core/models';
import type { PaymentData } from '@beabee/core/type';

import {
  SYNC_NEWSLETTER_RECONCILE_TESTS,
  SYNC_STRIPE_RECONCILE_TESTS,
} from '../constants/sync.js';

export interface SyncNewsletterActiveMemberTagArgs {
  since: Date;
  until: Date;
  dryRun: boolean;
}

export type SyncNewsletterReconcileTestId =
  (typeof SYNC_NEWSLETTER_RECONCILE_TESTS)[number];

export interface SyncNewsletterReconcileArgs {
  dryRun: boolean;
  report: boolean;
  importNew: boolean;
  uploadNew: boolean;
  fix: SyncNewsletterReconcileTestId[];
  since: Date | undefined;
  until: Date | undefined;
}

export interface SyncDryRunArgs {
  dryRun: boolean;
}

export interface SyncSegmentsArgs {
  segmentId: string;
  dryRun: boolean;
}

export interface SyncContactSyncServicePushArgs {
  contactIds: string[] | undefined;
  dryRun: boolean;
}

export type SyncStripeReconcileTestId =
  (typeof SYNC_STRIPE_RECONCILE_TESTS)[number];

export interface SyncStripeReconcileArgs {
  dryRun: boolean;
  report: boolean;
  contactIds: string[] | undefined;
  fix: SyncStripeReconcileTestId[];
  since: Date | undefined;
  until: Date | undefined;
}

/** A local payment as far as the reconciliation reads it */
export type StripeLocalPayment = Pick<Payment, 'id'> & PaymentData;

/** A local payment that differs from its Stripe invoice in the given fields */
export interface StripePaymentMismatch {
  payment: StripeLocalPayment;
  data: PaymentData;
  fields: (keyof PaymentData)[];
}

/** A Stripe invoice of a known contact without a local payment */
export interface StripeMissingPayment {
  id: string;
  contactId: string;
  data: PaymentData;
}

export interface StripePaymentReconciliation {
  mismatches: StripePaymentMismatch[];
  missing: StripeMissingPayment[];
  /** Local payments whose invoice no longer exists on Stripe */
  orphans: StripeLocalPayment[];
}
