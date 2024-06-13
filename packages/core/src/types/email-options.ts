import type { EmailAttachment } from "./index.js";

export interface EmailOptions {
  attachments?: EmailAttachment[];
  sendAt?: Date | undefined;
}
