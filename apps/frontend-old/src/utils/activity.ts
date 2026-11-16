import {
  ActivityActorType,
  type ActivityEventMetadataMap,
  type ActivityEventReference,
  type ActivityEventReferenceType,
  ActivityEventType,
  ContributionPeriod,
  type ContributionUpdateData,
  type GetActivityEventData,
} from '@beabee/beabee-common';

import { i18n } from '#lib/i18n';

const { t, te, n } = i18n.global;

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

function getEmailName(email: string): string | undefined {
  const key = `emails.templates.names.${email}`;
  // Only system templates have a name, a custom email is identified by its ID
  return te(key) ? t(key) : undefined;
}

function getContributionAmount(form: ContributionUpdateData['form']): string {
  return form.period === ContributionPeriod.Annually
    ? t('join.contribution.annually', {
        amount: n(form.monthlyAmount * 12, 'currency'),
      })
    : t('join.contribution.monthly', {
        amount: n(form.monthlyAmount, 'currency'),
      });
}

// Describes an event using its metadata, for every event type that has
// metadata: null if the metadata has nothing worth showing. A description can
// return undefined when this particular event can't be described
const eventDescriptions: {
  [T in keyof ActivityEventMetadataMap]:
    | ((metadata: ActivityEventMetadataMap[T]) => string | undefined)
    | null;
} = {
  [ActivityEventType.CalloutAnswered]: null,
  [ActivityEventType.ContactCreated]: (metadata) =>
    metadata.source
      ? t('activity.eventDescription.contactCreated', {
          source: metadata.source,
        })
      : undefined,
  [ActivityEventType.ContactContributionStarted]: (metadata) =>
    'form' in metadata
      ? t('activity.eventDescription.contactContributionStarted', {
          amount: getContributionAmount(metadata.form),
        })
      : undefined,
  [ActivityEventType.ContactContributionUpdated]: (metadata) =>
    t('activity.eventDescription.contactContributionUpdated', {
      amount: getContributionAmount(metadata.form),
    }),
  [ActivityEventType.ContactContributionCancelled]: null,
  [ActivityEventType.ContactPaymentFailed]: null,
  [ActivityEventType.ContactPaymentSuccessful]: null,
  [ActivityEventType.ContactRoleAdded]: (metadata) =>
    t('activity.eventDescription.contactRoleAdded', {
      role: t(`common.role.${metadata.roleType}`),
    }),
  [ActivityEventType.ContactEmailSent]: (metadata) => {
    const email = getEmailName(metadata.email);
    return email
      ? t('activity.eventDescription.contactEmailSent', { email })
      : undefined;
  },
  [ActivityEventType.EmailSent]: (metadata) => {
    const email = getEmailName(metadata.email);
    return email
      ? t('activity.eventDescription.emailSent', {
          email,
          recipient: metadata.recipient,
        })
      : undefined;
  },
  [ActivityEventType.EmailTemplateAdded]: (metadata) => {
    const template = metadata.templateId && getEmailName(metadata.templateId);
    return template
      ? t('activity.eventDescription.emailTemplateAdded', { template })
      : undefined;
  },
};

function hasDescription(
  eventType: ActivityEventType
): eventType is keyof ActivityEventMetadataMap {
  return eventType in eventDescriptions;
}

function describeEvent<T extends keyof ActivityEventMetadataMap>(
  eventType: T,
  metadata: ActivityEventMetadataMap[T]
): string | undefined {
  return eventDescriptions[eventType]?.(metadata);
}

/**
 * Get the description of an activity event: its label, with details from its
 * metadata where the event has any worth showing
 */
export function getEventDescription(
  event: Pick<GetActivityEventData, 'eventType' | 'metadata'>
): string {
  return (
    (event.metadata &&
      hasDescription(event.eventType) &&
      describeEvent(event.eventType, event.metadata)) ||
    getEventTypeLabel(event.eventType)
  );
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
  // A user without an ID made the request without being logged in. Every actor
  // type other than user (cron, webhook, etc.) is system
  return event.actorType === ActivityActorType.User
    ? t('activity.actorType.guest')
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
