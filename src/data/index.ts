export enum ContributionPeriod {
  Monthly = "monthly",
  Annually = "annually",
}

export enum ContributionType {
  Automatic = "Automatic",
  Manual = "Manual",
  Gift = "Gift",
  None = "None",
}

export enum ItemStatus {
  New = "new",
  Draft = "draft",
  Scheduled = "scheduled",
  Open = "open",
  Ended = "ended",
}

export enum MembershipStatus {
  Active = "active",
  Expiring = "expiring",
  Expired = "expired",
  None = "none",
}

export enum NewsletterStatus {
  Subscribed = "subscribed",
  Unsubscribed = "unsubscribed",
  Cleaned = "cleaned",
  Pending = "pending",
  None = "none",
}

export enum PaymentMethod {
  StripeCard = "s_card",
  StripeSEPA = "s_sepa",
  StripeBACS = "s_bacs",
  GoCardlessDirectDebit = "gc_direct-debit",
}

export enum PaymentStatus {
  Pending = "pending",
  Successful = "successful",
  Failed = "failed",
  Cancelled = "cancelled",
}

export const PermissionTypes = ["member", "admin", "superadmin"] as const;
export type PermissionType = typeof PermissionTypes[number];
