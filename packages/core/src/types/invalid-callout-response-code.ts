export type InvalidCalloutResponseCode =
  | "only-anonymous"
  | "expired-user"
  | "closed"
  | "cant-update"
  | "guest-fields-missing"
  | "logged-in-guest-fields"
  | "unknown-user";
