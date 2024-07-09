import { NewsletterStatus } from "@beabee/beabee-common";
import { UpdateNewsletterContact } from "./update-newsletter-contact";

export interface NewsletterContact extends UpdateNewsletterContact {
  firstname: string;
  lastname: string;
  joined: Date;
  status: NewsletterStatus;
  groups: string[];
  tags: string[];
  fields: Record<string, string>;
}
