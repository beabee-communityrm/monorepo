import type { EmailPerson, EmailMergeFields } from "./index.js";

export interface EmailRecipient {
  to: EmailPerson;
  mergeFields?: EmailMergeFields;
}
