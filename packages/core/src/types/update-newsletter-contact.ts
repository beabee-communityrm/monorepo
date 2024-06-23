import { NewsletterStatus } from "@beabee/beabee-common";

export interface UpdateNewsletterContact {
  email: string;
  status: NewsletterStatus;
  firstname?: string;
  lastname?: string;
  groups?: string[];
  fields?: Record<string, string>;
}
