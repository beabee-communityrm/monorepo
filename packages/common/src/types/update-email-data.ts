import { EmailPreviewData } from './index.js';

/**
 * Data for updating an email.
 * Subject and body are required; name is optional (custom emails only).
 */
export type UpdateEmailData = EmailPreviewData & { name?: string };
