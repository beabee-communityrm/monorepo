import {
  ActivityActorType,
  type ActivityEventReference,
  ActivityEventType,
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
 * Get the label for an actor that isn't a contact: every actor type other than
 * user (cron, webhook, etc.) is system
 */
export function getActorTypeLabel(type: ActivityActorType | null): string {
  return type === ActivityActorType.User
    ? t('activity.actorType.user')
    : t('activity.actorType.system');
}

/**
 * Get the admin page for the item a reference points to, if it has one
 */
export function getReferenceLink(
  reference: ActivityEventReference
): string | undefined {
  switch (reference.type) {
    case 'contact':
      return `/admin/contacts/${reference.id}`;
    case 'callout':
      return `/admin/crowdnewsroom/view/${reference.id}`;
    case 'contact-segment':
      return `/admin/contacts?segment=${reference.id}`;
    case 'email':
      return `/admin/contacts/email-templates/edit/${reference.id}`;
  }
}
