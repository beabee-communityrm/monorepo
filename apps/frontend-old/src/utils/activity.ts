import {
  ActivityActorType,
  type ActivityEventReference,
  type ActivityEventReferenceType,
  ActivityEventType,
  type GetActivityEventData,
} from '@beabee/beabee-common';

import { i18n } from '#lib/i18n';

const { t } = i18n.global;

// Event type names contain dots, which would be treated as nested keys
// Map names with dots to flattened names, such that they can be used as locale keys
const eventTypeKeys: Record<ActivityEventType, string> = {
  [ActivityEventType.AppWebhookUpdated]: 'appWebhookUpdated',
  [ActivityEventType.AppSettingsUpdated]: 'appSettingsUpdated',
  [ActivityEventType.AppPaymentOptionsUpdated]: 'appPaymentOptionsUpdated',
  [ActivityEventType.CalloutEdited]: 'calloutEdited',
  [ActivityEventType.CalloutCreated]: 'calloutCreated',
  [ActivityEventType.CalloutPublished]: 'calloutPublished',
  [ActivityEventType.CalloutUnpublished]: 'calloutUnpublished',
  [ActivityEventType.CalloutDeleted]: 'calloutDeleted',
  [ActivityEventType.CalloutAnswered]: 'calloutAnswered',
  [ActivityEventType.CalloutSegmentsAdded]: 'calloutSegmentsAdded',
  [ActivityEventType.CalloutSegmentsDeleted]: 'calloutSegmentsDeleted',
  [ActivityEventType.CalloutSegmentsUpdated]: 'calloutSegmentsUpdated',
  [ActivityEventType.ContactCreated]: 'contactCreated',
  [ActivityEventType.ContactDeleted]: 'contactDeleted',
  [ActivityEventType.ContactProfileUpdated]: 'contactProfileUpdated',
  [ActivityEventType.ContactUpdated]: 'contactUpdated',
  [ActivityEventType.ContactRoleAdded]: 'contactRoleAdded',
  [ActivityEventType.ContactRoleRevoked]: 'contactRoleRevoked',
  [ActivityEventType.ContactSegmentsAdded]: 'contactSegmentsAdded',
  [ActivityEventType.ContactSegmentsDeleted]: 'contactSegmentsDeleted',
  [ActivityEventType.ContactSegmentsUpdated]: 'contactSegmentsUpdated',
  [ActivityEventType.ContactContributionUpdated]: 'contactContributionUpdated',
  [ActivityEventType.ContactContributionStarted]: 'contactContributionStarted',
  [ActivityEventType.ContactContributionCancelled]:
    'contactContributionCancelled',
  [ActivityEventType.ContactNewsletterGroupsUpdated]:
    'contactNewsletterGroupsUpdated',
  [ActivityEventType.ContactEmailSent]: 'contactEmailSent',
  [ActivityEventType.EmailTemplateAdded]: 'emailTemplateAdded',
  [ActivityEventType.EmailTemplateEdited]: 'emailTemplateEdited',
  [ActivityEventType.EmailTemplateDeleted]: 'emailTemplateDeleted',
  [ActivityEventType.EmailSent]: 'emailSent',
  [ActivityEventType.EmailSendFailed]: 'emailSendFailed',
  [ActivityEventType.ContactPaymentInitiated]: 'contactPaymentInitiated',
  [ActivityEventType.ContactPaymentFailed]: 'contactPaymentFailed',
  [ActivityEventType.ContactPaymentSuccessful]: 'contactPaymentSuccessful',
  [ActivityEventType.ContactPaymentCancelled]: 'contactPaymentCancelled',
  [ActivityEventType.ContactPaymentRefunded]: 'contactPaymentRefunded',
  [ActivityEventType.NewsletterGroupsUpdated]: 'newsletterGroupsUpdated',
};

/**
 * Get the flattened label from raw activity event type name
 */
export function getEventTypeLabel(type: ActivityEventType): string {
  return t(`activity.eventType.${eventTypeKeys[type]}`);
}

/**
 * Get the label for an actor that has no name to show
 */
export function getActorLabel(
  event: Pick<GetActivityEventData, 'actorType' | 'actorId'>
): string {
  // An actor ID is always a contact, without a name they no longer exist
  if (event.actorId) return t('activity.deleted');
  // Some events were recorded without any details of who triggered them
  if (!event.actorType) return t('activity.actorType.unknown');
  // Every actor type other than user (cron, webhook, etc.) is system
  return event.actorType === ActivityActorType.User
    ? t('activity.actorType.user')
    : t('activity.actorType.system');
}

const referenceLinks: Record<
  ActivityEventReferenceType,
  ((id: string) => string) | null
> = {
  contact: (id) => `/admin/contacts/${id}`,
  callout: (id) => `/admin/crowdnewsroom/view/${id}`,
  'contact-segment': (id) => `/admin/contacts?segment=${id}`,
  email: (id) => `/admin/contacts/email-templates/edit/${id}`,
  // Its page is under the callout it belongs to, which a reference doesn't carry
  'callout-response-segment': null,
};

/**
 * Get the admin page for the item a reference points to, if it has one
 */
export function getReferenceLink(
  reference: ActivityEventReference
): string | undefined {
  return referenceLinks[reference.type]?.(reference.id);
}
