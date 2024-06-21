import type { ContactMfaData } from '@beabee/beabee-common';

export type GetContactMfaData = Pick<ContactMfaData, 'type'> | null;
