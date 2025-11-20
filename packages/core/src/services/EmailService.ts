import { Locale, isLocale } from '@beabee/locale';

import { isUUID } from 'class-validator';
import fs from 'fs';
import path from 'path';
import { loadFront } from 'yaml-front-matter';

import config from '#config/config';
import { getRepository } from '#database';
import { ExternalEmailTemplate } from '#errors/index';
import { log as mainLogger } from '#logging';
import { Contact, Email } from '#models/index';
import { MandrillProvider, SMTPProvider, SendGridProvider } from '#providers';
import { emailTemplateService } from '#services/EmailTemplateService';
import OptionsService from '#services/OptionsService';
import { formatEmailBody } from '#templates/email';
import {
  AdminEmailParams,
  AdminEmailTemplateId,
  ContactEmailParams,
  ContactEmailTemplateId,
  EmailMergeFields,
  EmailOptions,
  EmailPerson,
  EmailProvider,
  EmailRecipient,
  EmailTemplateId,
  GeneralEmailParams,
  GeneralEmailTemplateId,
  TemplateEmailOptions,
  TemplatePreviewOptions,
} from '#type/index';
import { expandNestedMergeFields, replaceMergeFields } from '#utils/email';

const log = mainLogger.child({ app: 'email-service' });

class EmailService {
  private readonly provider: EmailProvider =
    config.email.provider === 'mandrill'
      ? new MandrillProvider(config.email.settings)
      : config.email.provider === 'sendgrid'
        ? new SendGridProvider(config.email.settings)
        : new SMTPProvider(config.email.settings);

  private defaultEmails: Partial<
    Record<Locale, Partial<Record<EmailTemplateId, Email>>>
  > = {};

  constructor() {
    const emailDir = path.join(__dirname, '../data/email');
    const emailFiles = fs.readdirSync(emailDir);
    log.info('Loading default emails');

    for (const emailFile of emailFiles) {
      const [id, locale] = path.basename(emailFile, '.yfm').split('_', 2);
      if (!emailTemplateService.isTemplate(id) || !isLocale(locale)) {
        log.error(`Unknown ID (${id}) or locale (${locale})`);
        continue;
      }

      const { __content: body, ...data } = loadFront(
        fs.readFileSync(path.join(emailDir, emailFile))
      );
      // TODO: currently just spoofing an Email, could revisit
      const email = new Email();
      Object.assign(email, data);
      email.id = emailFile;
      email.body = body;

      if (!this.defaultEmails[locale as Locale]) {
        this.defaultEmails[locale as Locale] = {};
      }
      this.defaultEmails[locale as Locale]![id] = email;
    }
  }

  async sendEmail(
    email: Email,
    recipients: EmailRecipient[],
    opts?: EmailOptions
  ): Promise<void> {
    log.info('Sending email ' + email.id, { recipients });
    try {
      await this.provider.sendEmail(email, recipients, opts);
    } catch (error) {
      log.error('Unable to send email ' + email.id, error);
    }
  }

  async sendEmailToContact(
    email: Email,
    contacts: Contact[],
    opts?: EmailOptions
  ): Promise<void> {
    const recipients = contacts.map((contact) =>
      this.convertContactToRecipient(contact)
    );
    await this.sendEmail(email, recipients, opts);
  }

  /**
   * Send an email template
   * Generic method with overloads for type safety
   */
  async sendTemplate<T extends ContactEmailTemplateId>(
    template: T,
    params: ContactEmailParams<T>,
    opts?: TemplateEmailOptions
  ): Promise<void>;
  async sendTemplate<T extends AdminEmailTemplateId>(
    template: T,
    params: AdminEmailParams<T>,
    opts?: TemplateEmailOptions
  ): Promise<void>;
  async sendTemplate<T extends GeneralEmailTemplateId>(
    template: T,
    to: EmailPerson,
    params: GeneralEmailParams<T>,
    opts?: TemplateEmailOptions
  ): Promise<void>;
  async sendTemplate<T extends ContactEmailTemplateId | AdminEmailTemplateId>(
    template: T,
    params:
      | ContactEmailParams<T & ContactEmailTemplateId>
      | AdminEmailParams<T & AdminEmailTemplateId>,
    opts?: TemplateEmailOptions
  ): Promise<void>;
  async sendTemplate<T extends GeneralEmailTemplateId>(
    template: T,
    to: EmailPerson,
    params: GeneralEmailParams<T>,
    opts?: TemplateEmailOptions
  ): Promise<void>;
  async sendTemplate<
    T extends
      | ContactEmailTemplateId
      | AdminEmailTemplateId
      | GeneralEmailTemplateId,
  >(
    template: T,
    toOrParams:
      | ContactEmailParams<T & ContactEmailTemplateId>
      | AdminEmailParams<T & AdminEmailTemplateId>
      | EmailPerson,
    paramsOrOpts?:
      | GeneralEmailParams<T & GeneralEmailTemplateId>
      | TemplateEmailOptions,
    opts?: TemplateEmailOptions
  ): Promise<void> {
    let recipient: EmailRecipient;
    let required: boolean;
    let finalOpts: TemplateEmailOptions | undefined;

    if (emailTemplateService.isGeneral(template)) {
      // General template: second param is 'to', third is 'params'
      const to = toOrParams as EmailPerson;
      const generalParams = paramsOrOpts as GeneralEmailParams<
        T & GeneralEmailTemplateId
      >;
      const mergeFields = emailTemplateService.getMergeFields(
        template as GeneralEmailTemplateId,
        generalParams
      );

      recipient = {
        to,
        mergeFields,
      };
      required = false;
      finalOpts = opts;
    } else if (emailTemplateService.isContact(template)) {
      // Contact template: second param is 'params'
      const contactParams = toOrParams as ContactEmailParams<
        T & ContactEmailTemplateId
      >;
      const contact = contactParams.contact;
      log.info('Sending template to contact ' + contact.id);

      const mergeFields = emailTemplateService.getMergeFields(
        template as ContactEmailTemplateId,
        contactParams
      );

      recipient = this.convertContactToRecipient(contact, mergeFields);
      required = true;
      finalOpts = paramsOrOpts as TemplateEmailOptions;
    } else {
      // Admin template: second param is 'params'
      const adminParams = toOrParams as AdminEmailParams<
        T & AdminEmailTemplateId
      >;
      const mergeFields = emailTemplateService.getMergeFields(
        template as AdminEmailTemplateId,
        adminParams
      );

      recipient = {
        to: { email: OptionsService.getText('support-email') },
        mergeFields,
      };
      required = false;
      finalOpts = paramsOrOpts as TemplateEmailOptions;
    }

    await this.sendTemplateInternal(template, [recipient], finalOpts, required);
  }

  /**
   * Send a general email template to a specific recipient
   *
   * @param template The general email template ID
   * @param to The recipient's email address and name
   * @param params Template-specific parameters
   * @param opts Optional email options including customSubject
   */
  async sendTemplateTo<T extends GeneralEmailTemplateId>(
    template: T,
    to: EmailPerson,
    params: GeneralEmailParams<T>,
    opts?: TemplateEmailOptions
  ): Promise<void> {
    return this.sendTemplate(template, to, params, opts);
  }

  private async sendTemplateInternal(
    template: EmailTemplateId,
    recipients: EmailRecipient[],
    opts: TemplateEmailOptions | undefined,
    required: boolean
  ): Promise<void> {
    const providerTemplate = this.getProviderTemplate(template);
    if (providerTemplate) {
      log.info('Sending template ' + template, {
        template,
        providerTemplate,
        recipients,
      });
      try {
        await this.provider.sendTemplate(providerTemplate, recipients, opts);
      } catch (error) {
        log.error('Unable to send template ' + template, error);
      }
      // Fallback to cancelled contribution email if no no-survey variant
    } else if (template === 'cancelled-contribution-no-survey') {
      this.sendTemplateInternal(
        'cancelled-contribution',
        recipients,
        opts,
        required
      );
    } else {
      const defaultEmail = this.getDefaultEmail(template);
      if (defaultEmail) {
        // Allow custom subject override
        const email = opts?.customSubject
          ? { ...defaultEmail, subject: opts.customSubject }
          : defaultEmail;
        this.sendEmail(email, recipients, opts);
      } else if (required) {
        log.error(
          `Tried to send ${template} that has no provider template or default`
        );
      }
    }
  }

  /**
   * Get an email template
   *
   * @param template The template ID
   * @returns The email template, or:
   *   - `false` if the template is managed by an external email provider (not editable)
   *   - `null` if the template was not found (no provider template and no default template)
   *   - `Email` object if the template was found (either from provider or as default template)
   */
  async getTemplateEmail(
    template: EmailTemplateId
  ): Promise<false | Email | null> {
    const providerTemplate = this.getProviderTemplate(template);
    return providerTemplate
      ? await this.provider.getTemplateEmail(providerTemplate)
      : this.getDefaultEmail(template) || null;
  }

  async setTemplateEmail(
    template: EmailTemplateId,
    email: Email
  ): Promise<void> {
    await OptionsService.setJSON('email-templates', {
      ...OptionsService.getJSON('email-templates'),
      [template]: email.id,
    });
  }

  /**
   * Get a preview of an email template with merge fields replaced
   *
   * Provides a server-side preview that matches exactly what will be sent via email,
   * including merge field replacement, email footer, and inline CSS styles.
   *
   * @param template The template ID
   * @param contact Contact for base merge fields (EMAIL, NAME, FNAME, LNAME)
   * @param params Template-specific parameters (required for templates that need them)
   * @param opts Email options including customSubject, locale, and body override
   * @returns Preview with subject and body formatted exactly as it will be sent
   */
  async getTemplatePreview<T extends ContactEmailTemplateId>(
    template: T,
    contact: Contact,
    params: ContactEmailParams<T>,
    opts?: TemplatePreviewOptions
  ): Promise<{ subject: string; body: string }>;
  async getTemplatePreview<
    T extends ContactEmailParams<T> extends undefined
      ? ContactEmailTemplateId
      : never,
  >(
    template: T,
    contact: Contact,
    params?: undefined,
    opts?: TemplatePreviewOptions
  ): Promise<{ subject: string; body: string }>;
  async getTemplatePreview<T extends AdminEmailTemplateId>(
    template: T,
    contact: Contact,
    params: AdminEmailParams<T>,
    opts?: TemplatePreviewOptions
  ): Promise<{ subject: string; body: string }>;
  async getTemplatePreview<T extends GeneralEmailTemplateId>(
    template: T,
    contact: Contact,
    params: GeneralEmailParams<T>,
    opts?: TemplatePreviewOptions
  ): Promise<{ subject: string; body: string }>;
  async getTemplatePreview(
    template: EmailTemplateId,
    contact: Contact,
    params?:
      | ContactEmailParams<ContactEmailTemplateId>
      | AdminEmailParams<AdminEmailTemplateId>
      | GeneralEmailParams<GeneralEmailTemplateId>,
    opts?: TemplatePreviewOptions
  ): Promise<{ subject: string; body: string }> {
    const emailTemplate = await this.getTemplateEmail(template);

    if (emailTemplate === false) {
      throw new Error(
        `Template ${template} is managed by external provider and cannot be previewed`
      );
    }

    if (!emailTemplate) {
      throw new Error(`Template ${template} not found`);
    }

    const baseMergeFields: EmailMergeFields = {
      EMAIL: contact.email,
      NAME: contact.fullname,
      FNAME: contact.firstname,
      LNAME: contact.lastname,
    };

    // Get template-specific merge fields using typed params
    // getMergeFields handles all template types generically and ensures contact is included for contact templates
    const templateMergeFields = (
      emailTemplateService.getMergeFields as (
        template: EmailTemplateId,
        params?: unknown
      ) => EmailMergeFields
    )(
      template,
      emailTemplateService.isContact(template)
        ? { ...(params ?? {}), contact }
        : params
    );

    // Merge all fields: base fields, template-generated fields, and custom merge fields from opts
    // Custom merge fields from opts.mergeFields override template-generated fields
    const allMergeFields = {
      ...baseMergeFields,
      ...templateMergeFields, // TODO: Check if this is needed. Perhaps we could simply do without it and save a lot of code, or instead use the same logic that we use when sending emails?
      ...opts?.mergeFields,
    };

    const expandedFields = expandNestedMergeFields(allMergeFields);

    const subject = opts?.customSubject || (emailTemplate as Email).subject;
    const previewSubject = replaceMergeFields(subject, expandedFields);

    const templateBody = opts?.body || (emailTemplate as Email).body;
    const bodyWithMergeFields = replaceMergeFields(
      templateBody,
      expandedFields
    );
    const previewBody = formatEmailBody(bodyWithMergeFields);

    return {
      subject: previewSubject,
      body: previewBody,
    };
  }

  /**
   * Delete a template email override
   * @param template The template ID
   * @returns void
   */
  async deleteTemplateEmail(template: EmailTemplateId): Promise<void> {
    const currentTemplates = OptionsService.getJSON('email-templates') || {};
    if (currentTemplates[template]) {
      delete currentTemplates[template];
      await OptionsService.setJSON('email-templates', currentTemplates);
    }
  }

  /**
   * Find an email by ID (UUID) or template ID
   *
   * @param id The email ID (UUID) or template ID
   * @returns The email if found, or:
   *   - `null` if not found
   *   - Throws `ExternalEmailTemplate` if the template is managed by an external email provider
   */
  async findEmail(id: string): Promise<Email | null> {
    if (isUUID(id, '4')) {
      return await getRepository(Email).findOneBy({ id });
    } else if (emailTemplateService.isTemplate(id)) {
      const maybeEmail = await this.getTemplateEmail(id);
      if (maybeEmail) {
        return maybeEmail;
      } else if (maybeEmail === false) {
        throw new ExternalEmailTemplate();
      }
    }
    return null;
  }

  private getProviderTemplate(template: EmailTemplateId): string | undefined {
    return OptionsService.getJSON('email-templates')[template];
  }

  private getDefaultEmail(template: EmailTemplateId): Email | undefined {
    const locale = OptionsService.getText('locale');
    return (
      this.defaultEmails[locale]?.[template] ||
      this.defaultEmails.en?.[template]
    );
  }

  private convertContactToRecipient(
    contact: Contact,
    additionalMergeFields?: EmailMergeFields
  ): EmailRecipient {
    return {
      to: { email: contact.email, name: contact.fullname },
      mergeFields: {
        EMAIL: contact.email,
        NAME: contact.fullname,
        FNAME: contact.firstname,
        LNAME: contact.lastname,
        ...additionalMergeFields,
      },
    };
  }
}

export const emailService = new EmailService();
/** @deprecated Use `emailService` instead */
export default emailService;
