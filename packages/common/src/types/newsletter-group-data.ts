export interface BaseNewsletterGroupData {
  id: string;
  label: string;
}

export interface NewsletterGroupData extends BaseNewsletterGroupData {
  checked: boolean;
}
