import type { ContactMfaData } from '@type/contact-mfa-data';

export type GetContactMfaData = Pick<ContactMfaData, 'type'> | null;
