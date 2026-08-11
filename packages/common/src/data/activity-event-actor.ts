/** Possible types of actors that trigger events in the activity log */
export enum ActivityActorType {
  User = 'user', // event triggered by a user (admin or non-admin) via cookie
  ApiKey = 'api-key', // event triggered by a user via api key
  System = 'system', // event triggered by system
  Webhook = 'webhook', // event triggered by an external integration via webhook
  Cron = 'cron', // event triggered by a cron job
  BackendCLI = 'backend-cli', // event triggered by the backend CLI
}

export interface ActivityActor {
  actorType: ActivityActorType;
  actorId: string | null;
}
