/** Where the contact filter field picker has navigated to */
export type FilterPickerPath =
  | { type: 'root' }
  | { type: 'group'; groupId: string }
  | { type: 'callouts' }
  | { type: 'callout'; calloutId: string }
  | { type: 'calloutGroup'; calloutId: string; groupId: string };
