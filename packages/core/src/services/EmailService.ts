import { Locale, isLocale } from '@beabee/locale';

import { isUUID } from 'class-validator';
import fs from 'fs';
import path from 'path';
import { loadFront } from 'yaml-front-matter';

import config from '#config/config';
import {
  adminEmailTemplates,
  contactEmailTemplates,
  generalEmailTemplates,
} from '#data/email-templates';
import { getRepository } from '#database';
import { ExternalEmailTemplate } from '#errors/index';
import { log as mainLogger } from '#logging';
import { Contact, Email } from '#models/index';
import { MandrillProvider, SMTPProvider, SendGridProvider } from '#providers';
import OptionsService from '#services/OptionsService';
import { formatEmailBody } from '#templates/email';
import {
  AdminEmailTemplateId,
  AdminEmailTemplates,
  ContactEmailParams,
  ContactEmailTemplateId,
  EmailMergeFields,
  EmailOptions,
  EmailPerson,
  EmailProvider,
  EmailRecipient,
  EmailTemplateId,
  EmailTemplateType,
  GeneralEmailTemplateId,
  GeneralEmailTemplates,
  TemplateEmailOptions,
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
      if (!this.isTemplateId(id) || !isLocale(locale)) {
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

  async sendTemplateTo<T extends GeneralEmailTemplateId>(
    template: T,
    to: EmailPerson,
    params: Parameters<GeneralEmailTemplates[T]>[0],
    opts?: TemplateEmailOptions
  ): Promise<void> {
    const mergeFields = generalEmailTemplates[template](params as any); // https://github.com/microsoft/TypeScript/issues/30581
    await this.sendTemplate(template, [{ to, mergeFields }], opts, true);
  }

  async sendTemplateToContact<T extends ContactEmailTemplateId>(
    template: T,
    contact: Contact,
    params: ContactEmailParams<T>,
    opts?: TemplateEmailOptions
  ): Promise<void>;
  async sendTemplateToContact<
    T extends ContactEmailParams<T> extends undefined
      ? ContactEmailTemplateId
      : never,
  >(
    template: T,
    contact: Contact,
    params?: undefined,
    opts?: TemplateEmailOptions
  ): Promise<void>;
  async sendTemplateToContact<T extends ContactEmailTemplateId>(
    template: T,
    contact: Contact,
    params: ContactEmailParams<T>,
    opts?: TemplateEmailOptions
  ): Promise<void> {
    log.info('Sending template to contact ' + contact.id);

    const recipient = this.convertContactToRecipient(
      contact,
      contactEmailTemplates[template](contact, params as any) // https://github.com/microsoft/TypeScript/issues/30581
    );

    await this.sendTemplate(template, [recipient], opts, true);
  }

  async sendTemplateToAdmin<T extends AdminEmailTemplateId>(
    template: T,
    params: Parameters<AdminEmailTemplates[T]>[0],
    opts?: TemplateEmailOptions
  ): Promise<void> {
    const recipient = {
      to: { email: OptionsService.getText('support-email') },
      mergeFields: adminEmailTemplates[template](params as any),
    };

    await this.sendTemplate(template, [recipient], opts, false);
  }

  private async sendTemplate(
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
      this.sendTemplate('cancelled-contribution', recipients, opts, required);
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
   * This method supports all template types (general, admin, contact) and provides
   * a server-side preview that matches exactly what will be sent via email
   *
   * The preview includes:
   * - Merge field replacement (contact fields, template-specific fields, custom fields)
   * - Email footer with organization info, logo, and links
   * - Inline CSS styles via juice for consistent email client rendering
   *
   * @param template The template ID
   * @param type The template type (general, admin, contact)
   * @param contact Contact for contact-specific fields (required, uses authenticated user)
   * @param customMergeFields Custom merge fields to override/extend default fields
   * @param opts Email options including customSubject and locale
   * @returns Preview with subject and body formatted exactly as it will be sent
   */
  async getTemplatePreview(
    template: EmailTemplateId,
    type: EmailTemplateType,
    contact: Contact,
    customMergeFields: Record<string, string> = {},
    opts?: TemplateEmailOptions & { locale?: Locale; body?: string }
  ): Promise<{ subject: string; body: string }> {
    // 1. Get the email template (from provider or default templates)
    const emailTemplate = await this.getTemplateEmail(template);

    if (emailTemplate === false) {
      throw new Error(
        `Template ${template} is managed by external provider and cannot be previewed`
      );
    }

    if (!emailTemplate) {
      throw new Error(`Template ${template} not found`);
    }

    // 2. Generate base merge fields from contact
    const baseMergeFields: EmailMergeFields = {
      EMAIL: contact.email,
      NAME: contact.fullname,
      FNAME: contact.firstname,
      LNAME: contact.lastname,
    };

    // 3. Generate template-specific merge fields
    let templateMergeFields: EmailMergeFields = {};
    if (type === 'contact' && template in contactEmailTemplates) {
      templateMergeFields = contactEmailTemplates[
        template as ContactEmailTemplateId
      ](contact, {} as any);
    } else if (type === 'admin' && template in adminEmailTemplates) {
      // Admin templates need specific params, use empty object as fallback
      templateMergeFields = {};
    } else if (type === 'general' && template in generalEmailTemplates) {
      // General templates need specific params, use empty object as fallback
      templateMergeFields = {};
    }

    // 4. Merge all fields (custom fields override template fields)
    const allMergeFields = {
      ...baseMergeFields,
      ...templateMergeFields,
      ...customMergeFields,
    };

    // 5. Expand nested merge fields (handles MESSAGE with nested fields)
    const expandedFields = expandNestedMergeFields(allMergeFields);

    // 6. Replace merge fields in subject
    const subject = opts?.customSubject || (emailTemplate as Email).subject;
    const previewSubject = replaceMergeFields(subject, expandedFields);

    // 7. Replace merge fields in body and apply email formatting
    // This includes adding the footer and inline CSS styles, exactly as in actual emails
    // Use provided body override if available, otherwise use template body
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
   * Determine the template type from a template ID
   * @param template The template ID
   * @returns The template type (general, admin, or contact)
   */
  getTemplateType(template: string): EmailTemplateType | null {
    if (template in generalEmailTemplates) {
      return 'general';
    } else if (template in adminEmailTemplates) {
      return 'admin';
    } else if (template in contactEmailTemplates) {
      return 'contact';
    }
    return null;
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

  isTemplateId(template: string): template is EmailTemplateId {
    return (
      template in generalEmailTemplates ||
      template in adminEmailTemplates ||
      template in contactEmailTemplates
    );
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
    } else if (this.isTemplateId(id)) {
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
export default emailService;
