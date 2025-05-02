import { NewsletterGroupData } from "./index";

export interface CalloutNewsletterSchema {
  title: string;
  text: string;
  optIn: string;
  groups: NewsletterGroupData[];
}
