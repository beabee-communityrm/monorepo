import type { ContactMfa } from "#models/index";

/**
 * The **secure** contact multi factor authentication information without the `secret` key
 */
export type ContactMfaSecure = Pick<ContactMfa, "id" | "type">;
