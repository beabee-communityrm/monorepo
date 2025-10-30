import { RESET_SECURITY_FLOW_TYPE } from '@beabee/beabee-common';
import { expandNestedMergeFields } from '@beabee/beabee-common';

import config from '#config/config';
import { createQueryBuilder, getRepository } from '#database';
import { log as mainLogger } from '#logging';
import {
  Callout,
  CalloutResponse,
  CalloutVariant,
  Contact,
  Email,
} from '#models/index';
import OptionsService from '#services/OptionsService';
import ResetSecurityFlowService from '#services/ResetSecurityFlowService';
import { formatEmailBody } from '#templates/email';
import type {
  EmailOptions,
  EmailProvider,
  EmailRecipient,
  EmailTemplate,
  PreparedEmail,
  TemplateEmailOptions,
} from '#type/index';
import { formatCalloutResponseAnswersPreview } from '#utils/callout';

const log = mainLogger.child({ app: 'base-email-provider' });

function generateResetPasswordLinks(type: 'set' | 'reset') {
  const mergeField = type === 'set' ? 'SPLINK' : 'RPLINK';
  const baseUrl = `${config.audience}/auth/${type}-password`;
  const fallbackUrl = `${config.audience}/auth/login`;

  return async (recipients: EmailRecipient[]): Promise<EmailRecipient[]> => {
    // Filter for those with no merge field value
    const emails = recipients
      .filter((r) => !r.mergeFields?.[mergeField])
      .map((r) => r.to.email);

    // Nothing to do
    if (emails.length === 0) {
      return recipients;
    }

    log.info(`Creating ${emails.length} links for ${mergeField}`);

    // Get list of contacts who match the recipients
    const contacts = await createQueryBuilder(Contact, 'c')
      .select(['id', 'email'])
      .where('c.email IN (:...emails)', { emails })
      .getRawMany<{ id: string; email: string }>();

    const contactIdsByEmail = Object.fromEntries(
      contacts.map((m) => [m.email, m.id])
    );

    const rpFlowIdsByContactId = await ResetSecurityFlowService.createManyRaw(
      Object.values(contactIdsByEmail),
      RESET_SECURITY_FLOW_TYPE.PASSWORD
    );

    return recipients.map((recipient) => {
      // Don't touch recipients with the merge field already set
      if (recipient.mergeFields?.[mergeField]) {
        return recipient;
      } else {
        const rpFlowId =
          rpFlowIdsByContactId[contactIdsByEmail[recipient.to.email]];
        return {
          ...recipient,
          mergeFields: {
            ...recipient.mergeFields,
            [mergeField]: rpFlowId ? `${baseUrl}/${rpFlowId}` : fallbackUrl,
          },
        };
      }
    });
  };
}

export const magicMergeFields = [
  'SPLINK',
  'LOGINLINK',
  'RPLINK',
  'ANSWERS',
] as const;

export const magicMergeFieldsProcessors = {
  SPLINK: generateResetPasswordLinks('set'),
  RPLINK: generateResetPasswordLinks('reset'),
  LOGINLINK: async (recipients: EmailRecipient[]) => {
    // TODO: generate login override link
    return recipients.map((recipient) =>
      recipient.mergeFields?.LOGINLINK
        ? recipient
        : {
            ...recipient,
            mergeFields: {
              ...recipient.mergeFields,
              LOGINLINK: `${config.audience}/auth/login`,
            },
          }
    );
  },
  ANSWERS: async (recipients: EmailRecipient[]) => {
    // Process ANSWERS merge field for callout-response-answers template
    return Promise.all(
      recipients.map(async (recipient) => {
        // Only process if ANSWERS is not already provided and CALLOUTSLUG is available
        if (
          recipient.mergeFields?.ANSWERS ||
          !recipient.mergeFields?.CALLOUTSLUG
        ) {
          return recipient;
        }

        const calloutSlug = recipient.mergeFields.CALLOUTSLUG;

        // Fetch callout by slug
        const callout = await getRepository(Callout).findOne({
          where: { slug: calloutSlug },
        });

        if (callout) {
          // Get default variant for component text translations
          const defaultVariant =
            callout.variants?.find((v) => v.name === 'default') ||
            (await getRepository(CalloutVariant).findOneByOrFail({
              calloutId: callout.id,
              name: 'default',
            }));

          // Generate preview HTML with empty answer placeholders instead of real responses
          const answersHtml = formatCalloutResponseAnswersPreview(
            callout.formSchema,
            defaultVariant.componentText
          );

          return {
            ...recipient,
            mergeFields: {
              ...recipient.mergeFields,
              ANSWERS: answersHtml,
            },
          };
        }

        return recipient;
      })
    );
  },
} as const;

export abstract class BaseProvider implements EmailProvider {
  protected abstract doSendEmail(
    email: PreparedEmail,
    recipients: EmailRecipient[],
    opts?: EmailOptions | undefined
  ): Promise<void>;

  async sendEmail(
    email: Email,
    recipients: EmailRecipient[],
    opts?: EmailOptions | undefined
  ): Promise<void> {
    const preparedEmail = {
      ...email,
      body: formatEmailBody(email.body),
      fromEmail: email.fromEmail || OptionsService.getText('support-email'),
      fromName:
        email.fromName ||
        (email.fromEmail ? '' : OptionsService.getText('support-email-from')),
    };

    // Process magic merge fields (e.g., SPLINK, RPLINK, LOGINLINK, ANSWERS)
    let preparedRecipients = recipients;
    for (const mergeField of magicMergeFields) {
      const appearsInBody = email.body.includes(`*|${mergeField}|*`);
      const appearsInSubject = email.subject.includes(`*|${mergeField}|*`);
      const appearsInMergeFields = recipients.some(
        (recipient) =>
          recipient.mergeFields &&
          Object.values(recipient.mergeFields).some(
            (value) =>
              typeof value === 'string' && value.includes(`*|${mergeField}|*`)
          )
      );

      if (appearsInBody || appearsInSubject || appearsInMergeFields) {
        preparedRecipients =
          await magicMergeFieldsProcessors[mergeField](preparedRecipients);
      }
    }

    // Expand nested merge fields to handle cases where a merge field value
    // itself contains other merge fields (e.g., MESSAGE containing *|FNAME|*)
    preparedRecipients = preparedRecipients.map((recipient) => {
      if (!recipient.mergeFields) return recipient;

      return {
        ...recipient,
        mergeFields: expandNestedMergeFields(recipient.mergeFields),
      };
    });

    await this.doSendEmail(preparedEmail, preparedRecipients, opts);
  }

  async sendTemplate(
    templateId: string,
    recipients: EmailRecipient[],
    opts?: TemplateEmailOptions
  ): Promise<void> {
    const email = await getRepository(Email).findOneBy({ id: templateId });
    if (email) {
      await this.sendEmail(email, recipients, opts);
    }
  }

  async getTemplateEmail(templateId: string): Promise<false | Email | null> {
    return (await getRepository(Email).findOneBy({ id: templateId })) || null;
  }

  async getTemplates(): Promise<EmailTemplate[]> {
    const emails = await getRepository(Email).find();
    return emails.map((email) => ({ id: email.id, name: email.name }));
  }
}

/** @deprecated Use named import BaseProvider instead */
export default BaseProvider;
