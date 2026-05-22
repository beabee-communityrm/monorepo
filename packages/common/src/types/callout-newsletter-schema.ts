import { type NewsletterGroupData } from './index.js';

export interface CalloutNewsletterSchema {
  title: string;
  text: string;
  optIn: string;
  groups: NewsletterGroupData[];
}
