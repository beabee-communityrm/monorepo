// Possible types of actors that trigger events in the activity log
export enum ActivityActorType {
  User = 'user', // event triggered by a user (admin or non-admin)
  System = 'system', // event triggered by system (automated emails, setup steps)
  Webhook = 'webhook', // event triggered by an external integration via webhook
  Callout = 'callout', // event triggered by a callout (signups, newsletter subscriptions)
}
