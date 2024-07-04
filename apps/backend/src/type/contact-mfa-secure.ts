import type ContactMfa from "@beabee/beabee-core/models/ContactMfa";

/**
 * The **secure** contact multi factor authentication information without the `secret` key
 */
export type ContactMfaSecure = Pick<ContactMfa, "id" | "type">;
