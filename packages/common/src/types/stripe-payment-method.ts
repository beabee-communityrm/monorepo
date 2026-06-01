// Use this to avoid having to import the entire Stripe package to common

export type StripePaymentMethod =
  | 'card'
  | 'sepa_debit'
  | 'bacs_debit'
  | 'paypal'
  | 'ideal';
