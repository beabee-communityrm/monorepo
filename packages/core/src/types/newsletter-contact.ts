import { NewsletterStatus } from "@beabee/beabee-common";
import type { UpdateNewsletterContact } from "./index.js";

export interface NewsletterContact extends UpdateNewsletterContact {
  firstname: string;
  lastname: string;
  joined: Date;
  status: NewsletterStatus;
  groups: string[];
  tags: string[];
  fields: Record<string, string>;
}
