import type { ContactMfaData } from "./contact-mfa-data.ts";

export type GetContactMfaData = Pick<ContactMfaData, "type"> | null;
