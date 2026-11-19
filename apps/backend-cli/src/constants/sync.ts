export const SYNC_NEWSLETTER_RECONCILE_TESTS = [
  'status',
  'groups',
  'active-member-tag',
  'active-user-tag',
] as const;

export const SYNC_STRIPE_RECONCILE_TESTS = [
  'subscriptions',
  'payments',
  'missing-payments',
  'mandates',
  'customers',
] as const;
