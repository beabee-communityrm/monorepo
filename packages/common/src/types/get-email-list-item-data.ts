/**
 * Email list item data with metadata about system email overrides and segment usage
 */
export interface GetEmailListItemData {
  id: string;
  name: string;
  subject: string;
  date: string;
  mailingCount: number;
  isSystem: boolean;
  isSegment: boolean;
}
