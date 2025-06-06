import type { ContactMfaData } from './contact-mfa-data.js';

export type GetContactMfaData = Pick<ContactMfaData, 'type'> | null;
