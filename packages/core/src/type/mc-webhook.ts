export interface MCWebhook {
  id: string;
  url: string;
  sources: { user: boolean; admin: boolean; api: boolean };
  events: Record<string, boolean>;
}
