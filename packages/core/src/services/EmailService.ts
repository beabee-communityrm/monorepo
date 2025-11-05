import {
  expandNestedMergeFields,
  replaceMergeFields,
} from '@beabee/beabee-common';
import { Locale, isLocale } from '@beabee/locale';

import fs from 'fs';
import path from 'path';
import { loadFront } from 'yaml-front-matter';

import config from '#config/config';
import {
  adminEmailTemplates,
  contactEmailTemplates,
  generalEmailTemplates,
} from '#data/email-templates';
import { log as mainLogger } from '#logging';
import { Contact, Email } from '#models/index';
import { MandrillProvider, SMTPProvider, SendGridProvider } from '#providers';
import {
  magicMergeFields,
  magicMergeFieldsProcessors,
} from '#providers/email/BaseProvider';
import OptionsService from '#services/OptionsService';
import {
  AdminEmailTemplateId,
  AdminEmailTemplates,
  AdminTemplateFunction,
  ContactEmailParams,
  ContactEmailTemplateId,
  ContactTemplateFunction,
  EmailMergeFields,
  EmailOptions,
  EmailPerson,
  EmailProvider,
  EmailRecipient,
  EmailTemplateId,
  EmailTemplateType,
  GeneralEmailTemplateId,
  GeneralEmailTemplates,
  GeneralTemplateFunction,
  TemplateEmailOptions,
  TemplateMergeFieldResult,
} from '#type/index';
import {
  extractTemplateParams,
  isAdminEmailTemplateId,
  isContactEmailTemplateId,
  isEmailTemplateId,
  isGeneralEmailTemplateId,
} from '#utils/email';

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
      await this.sendTemplate(
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
        await this.sendEmail(email, recipients, opts);
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
   * Generate base merge fields from contact information
   */
  private generateBaseMergeFields(contact: Contact): EmailMergeFields {
    return {
      EMAIL: contact.email || '',
      NAME: contact.fullname || '',
      FNAME: contact.firstname || '',
      LNAME: contact.lastname || '',
    };
  }

  /**
   * Generate merge fields for contact templates
   */
  private generateContactTemplateMergeFields<T extends ContactEmailTemplateId>(
    template: T,
    contact: Contact,
    customMergeFields: Record<string, string>
  ): EmailMergeFields {
    const templateFn = contactEmailTemplates[
      template
    ] as ContactTemplateFunction<T>;

    if (templateFn.length > 1) {
      // Template expects parameters - extract them using the mapping system
      const templateParams = extractTemplateParams(template, customMergeFields);

      try {
        return templateFn(contact, templateParams as ContactEmailParams<T>);
      } catch (error) {
        log.error(`Error calling contact template function for ${template}:`, {
          template,
          templateParams,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    } else {
      // Template doesn't expect parameters - use empty params
      return templateFn(contact, {} as ContactEmailParams<T>);
    }
  }

  /**
   * Generate merge fields for admin templates
   */
  private generateAdminTemplateMergeFields<T extends AdminEmailTemplateId>(
    template: T,
    customMergeFields: Record<string, string>
  ): EmailMergeFields {
    const templateFn = adminEmailTemplates[
      template
    ] as AdminTemplateFunction<T>;

    if (templateFn.length > 1) {
      // Template expects parameters - extract them using the mapping system
      const templateParams = extractTemplateParams(template, customMergeFields);
      return templateFn(
        templateParams as Parameters<AdminEmailTemplates[T]>[0]
      );
    } else {
      return templateFn({} as Parameters<AdminEmailTemplates[T]>[0]);
    }
  }

  /**
   * Generate merge fields for general templates
   */
  private generateGeneralTemplateMergeFields<T extends GeneralEmailTemplateId>(
    template: T,
    customMergeFields: Record<string, string>
  ): EmailMergeFields {
    const templateFn = generalEmailTemplates[
      template
    ] as GeneralTemplateFunction<T>;

    if (templateFn.length > 1) {
      // Template expects parameters - extract them using the mapping system
      const templateParams = extractTemplateParams(template, customMergeFields);
      return templateFn(
        templateParams as Parameters<GeneralEmailTemplates[T]>[0]
      );
    } else {
      return templateFn({} as Parameters<GeneralEmailTemplates[T]>[0]);
    }
  }

  /**
   * Generate template-specific merge fields based on template type
   */
  private generateTemplateMergeFields(
    template: EmailTemplateId,
    type: EmailTemplateType,
    contact: Contact,
    customMergeFields: Record<string, string>
  ): EmailMergeFields {
    switch (type) {
      case 'contact':
        if (isContactEmailTemplateId(template)) {
          return this.generateContactTemplateMergeFields(
            template,
            contact,
            customMergeFields
          );
        }
        break;

      case 'admin':
        if (isAdminEmailTemplateId(template)) {
          return this.generateAdminTemplateMergeFields(
            template,
            customMergeFields
          );
        }
        break;

      case 'general':
        if (isGeneralEmailTemplateId(template)) {
          return this.generateGeneralTemplateMergeFields(
            template,
            customMergeFields
          );
        }
        break;
    }

    return {};
  }

  /**
   * Process magic merge fields for email preview
   */
  private async processMagicMergeFields(
    mergeFields: EmailMergeFields,
    emailBody: string,
    contact: Contact
  ): Promise<EmailMergeFields> {
    // Check if any magic merge fields are needed
    const needsMagicProcessing = magicMergeFields.some(
      (mergeField) =>
        emailBody.includes(`*|${mergeField}|*`) ||
        Object.values(mergeFields).some(
          (value) =>
            typeof value === 'string' && value.includes(`*|${mergeField}|*`)
        )
    );

    if (!needsMagicProcessing) {
      return mergeFields;
    }

    // Create a temporary recipient to process magic merge fields
    const tempRecipient: EmailRecipient = {
      to: { email: contact.email || '', name: contact.fullname || '' },
      mergeFields,
    };

    // Process each magic merge field
    let processedRecipients = [tempRecipient];
    for (const mergeField of magicMergeFields) {
      const appearsInBody = emailBody.includes(`*|${mergeField}|*`);
      const appearsInMergeFields = Object.values(mergeFields).some(
        (value) =>
          typeof value === 'string' && value.includes(`*|${mergeField}|*`)
      );

      if (appearsInBody || appearsInMergeFields) {
        processedRecipients =
          await magicMergeFieldsProcessors[mergeField](processedRecipients);
      }
    }

    // Extract the processed merge fields
    return processedRecipients[0]?.mergeFields || mergeFields;
  }

  /**
   * Replace and expand merge fields in email content
   */
  private processMergeFields(
    mergeFields: EmailMergeFields,
    emailBody: string,
    emailSubject: string
  ): { subject: string; body: string } {
    // Expand nested merge fields (handles MESSAGE with nested fields)
    let expandedFields: EmailMergeFields;
    try {
      expandedFields = expandNestedMergeFields(mergeFields);
    } catch (error) {
      log.error(`Error expanding nested merge fields:`, {
        processedMergeFields: mergeFields,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }

    // Replace merge fields in subject and body
    const subject = replaceMergeFields(emailSubject, expandedFields);
    const body = replaceMergeFields(emailBody, expandedFields);

    return { subject, body };
  }

  /**
   * Get a preview of an email template with merge fields replaced
   * This method supports all template types (general, admin, contact) and provides
   * a flexible way to preview emails with custom merge fields and locale support
   *
   * @param template The template ID
   * @param type The template type (general, admin, contact)
   * @param contact Contact for contact-specific fields (required, uses authenticated user)
   * @param customMergeFields Custom merge fields to override/extend default fields
   * @param opts Email options including customSubject and locale
   * @returns Preview with subject and body with merge fields replaced
   */
  async getTemplatePreview(
    template: EmailTemplateId,
    type: EmailTemplateType,
    contact: Contact,
    customMergeFields: Record<string, string> = {},
    opts?: TemplateEmailOptions & { locale?: Locale }
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
    const baseMergeFields = this.generateBaseMergeFields(contact);

    // 3. Generate template-specific merge fields
    const templateMergeFields = this.generateTemplateMergeFields(
      template,
      type,
      contact,
      customMergeFields
    );

    // 4. Merge all fields (custom fields override template fields)
    const allMergeFields = {
      ...baseMergeFields,
      ...templateMergeFields,
      ...customMergeFields,
    };

    // 5. Process magic merge fields (e.g., ANSWERS, SPLINK, RPLINK)
    const emailBody = (emailTemplate as Email).body || '';
    const processedMergeFields = await this.processMagicMergeFields(
      allMergeFields,
      emailBody,
      contact
    );

    // 6. Replace and expand merge fields in subject and body
    const emailSubject =
      opts?.customSubject || (emailTemplate as Email).subject || '';
    const result = this.processMergeFields(
      processedMergeFields,
      emailBody,
      emailSubject
    );

    return result;
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
    return isEmailTemplateId(template);
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
