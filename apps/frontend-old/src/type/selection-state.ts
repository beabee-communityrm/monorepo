export type SelectionState =
  | { mode: 'explicit'; ids: string[] }
  | { mode: 'all'; excludedIds: string[] };
