import { EmailTemplateType } from '@beabee/beabee-common';
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
  getBaseEmailMergeFields,
  getContactEmailMergeFields,
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
  GeneralEmailTemplateId,
  GeneralEmailTemplates,
  PreviewEmailOptions,
} from '#type/index';
import { replaceMergeFields } from '#utils/email';

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

  /**
   * Send a raw email directly to recipients
   *
   * Base method for sending emails. Sends an Email entity directly without template
   * processing or automatic merge field enrichment. Only merge fields explicitly
   * provided in recipients are available.
   *
   * **When to use:**
   * - Sending pre-configured Email entities from the database
   * - When you already have EmailRecipient objects ready
   * - For low-level email sending without template logic
   *
   * @param email The Email entity to send
   * @param recipients List of email recipients with merge fields
   * @param opts Optional email options (attachments, sendAt, etc.)
   */
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

  /**
   * Send an email to one or more contacts
   *
   * Convenience wrapper that automatically converts Contact objects to EmailRecipient
   * objects with contact and base merge fields. See email-templates.ts for available
   * merge fields.
   *
   * **When to use:**
   * - Sending a pre-configured Email entity to contacts
   * - Bulk sending the same email to multiple contacts
   *
   * @param email The Email entity to send
   * @param contacts List of contacts to send the email to
   * @param opts Optional email options (attachments, sendAt, etc.)
   */
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
   * Send a custom email to a contact with custom subject and body
   *
   * Creates a new Email entity on-the-fly with custom subject and body content.
   * Useful for user-generated email content (e.g., callout response emails with
   * custom messages configured by admins). Merge fields are automatically replaced
   * by the email provider. See email-templates.ts for available merge fields.
   *
   * **When to use:**
   * - Sending emails with user-defined subject and body content
   * - Callout response confirmation emails with custom messages
   * - Dynamically generated email content (not from templates)
   *
   * @param contact The contact to send the email to
   * @param subject Email subject (supports merge fields)
   * @param body Email body (supports merge fields)
   * @param opts Optional email options including mergeFields for additional custom fields
   * @returns Promise that resolves when the email is sent
   */
  async sendCustomEmailToContact(
    contact: Contact,
    subject: string,
    body: string,
    opts?: EmailOptions & { mergeFields?: EmailMergeFields }
  ): Promise<void> {
    const email = new Email();
    email.subject = subject;
    email.body = body;
    const recipient = this.convertContactToRecipient(
      contact,
      opts?.mergeFields
    );
    await this.sendEmail(email, [recipient], opts);
  }

  /**
   * Send a general email template
   *
   * Sends emails from general templates that are not specific to contacts or admins.
   * Used for system-wide notifications (e.g., email confirmation, gift purchases).
   * Can be sent to any email address. See email-templates.ts for template parameters
   * and available merge fields.
   *
   * **When to use:**
   * - Email confirmation links (confirm-email)
   * - Gift purchase notifications (purchased-gift)
   * - Expired special URL resends (expired-special-url-resend)
   * - Any email that doesn't require a Contact entity
   *
   * @param template The general email template ID
   * @param to The recipient email address and name
   * @param params Template-specific parameters required by the template
   * @param opts Optional email options (locale, etc.)
   */
  async sendTemplateTo<T extends GeneralEmailTemplateId>(
    template: T,
    to: EmailPerson,
    params: Parameters<GeneralEmailTemplates[T]>[0],
    opts?: EmailOptions
  ): Promise<void> {
    const templateMergeFields = generalEmailTemplates[template](params as any); // https://github.com/microsoft/TypeScript/issues/30581
    const mergeFields = this.enrichMergeFields(templateMergeFields);
    await this.sendTemplate(template, [{ to, mergeFields }], opts, true);
  }

  /**
   * Send a contact email template to a contact
   *
   * Sends emails from contact-specific templates for member/contact communications.
   * Templates can be managed via external providers (Mandrill, SendGrid) or use
   * default templates from the database. Automatically includes contact and base
   * merge fields. See email-templates.ts for template parameters and merge fields.
   *
   * **When to use:**
   * - Welcome emails, password resets, contribution cancellations
   * - Referral success, gift activation, and other member-facing emails
   * - Any predefined template for contacts
   *
   * @param template The contact email template ID
   * @param contact The contact to send the email to
   * @param params Template-specific parameters (varies by template)
   * @param opts Optional email options
   */
  async sendTemplateToContact<T extends ContactEmailTemplateId>(
    template: T,
    contact: Contact,
    params?: ContactEmailParams<T>,
    opts?: EmailOptions
  ): Promise<void> {
    log.info('Sending template to contact ' + contact.id);

    const recipient = this.convertContactToRecipient(
      contact,
      contactEmailTemplates[template](contact, params as any) // https://github.com/microsoft/TypeScript/issues/30581
    );

    await this.sendTemplate(template, [recipient], opts, true);
  }

  /**
   * Send an admin email template
   *
   * Sends notification emails to administrators. Always sent to the support email
   * address configured in the system. Used for system notifications about member
   * activities. See email-templates.ts for template parameters and merge fields.
   *
   * **When to use:**
   * - Notifying admins about new members, cancellations, callout responses
   * - Any admin-facing notification email
   *
   * @param template The admin email template ID
   * @param params Template-specific parameters required by the template
   * @param opts Optional email options (locale, etc.)
   */
  async sendTemplateToAdmin<T extends AdminEmailTemplateId>(
    template: T,
    params: Parameters<AdminEmailTemplates[T]>[0],
    opts?: EmailOptions
  ): Promise<void> {
    const templateMergeFields = adminEmailTemplates[template](params as any);
    const recipient = {
      to: { email: OptionsService.getText('support-email') },
      mergeFields: this.enrichMergeFields(templateMergeFields),
    };

    await this.sendTemplate(template, [recipient], opts, false);
  }

  /**
   * Internal method to send email templates
   *
   * Handles template resolution: external provider templates (Mandrill, SendGrid) or
   * default templates from database. Called by sendTemplateTo, sendTemplateToContact,
   * and sendTemplateToAdmin.
   *
   * **Template resolution:**
   * 1. External provider template (if configured)
   * 2. Default template from database
   * 3. Special fallback: cancelled-contribution-no-survey → cancelled-contribution
   *
   * @param template The template ID to send
   * @param recipients List of recipients with merge fields
   * @param opts Optional email options
   * @param required Whether the template is required (logs error if missing)
   */
  private async sendTemplate(
    template: EmailTemplateId,
    recipients: EmailRecipient[],
    opts: EmailOptions | undefined,
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
        this.sendEmail(defaultEmail, recipients, opts);
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
   * Get a preview of an email with merge fields replaced
   * This method supports using a template as a base and provides
   * a server-side preview that matches exactly what will be sent via email
   *
   * The preview includes:
   * - Merge field replacement (contact fields and custom merge fields)
   * - Email footer with organization info, logo, and links
   * - Inline CSS styles via juice for consistent email client rendering
   *
   * @param contact Contact for contact-specific fields (required, uses authenticated user)
   * @param opts Email options including locale, and body override
   * @returns Preview with subject and body formatted exactly as it will be sent
   */
  async getPreview(
    contact: Contact,
    opts?: PreviewEmailOptions
  ): Promise<{ subject: string; body: string }> {
    // 1. Get the email template (from provider or default templates)
    const emailTemplate = opts?.templateId
      ? await this.getTemplateEmail(opts.templateId)
      : null;

    if (emailTemplate === false) {
      throw new ExternalEmailTemplate();
    }

    // 2. Generate base merge fields from contact and standard fields
    const mergeFields: EmailMergeFields = {
      ...getContactEmailMergeFields(contact),
      ...getBaseEmailMergeFields(),
      ...opts?.mergeFields,
    };

    // 3. Replace merge fields in body and apply email formatting
    // This includes adding the footer and inline CSS styles, exactly as in actual emails
    // Use provided body override if available, otherwise use template body
    const templateBody = opts?.body || emailTemplate?.body || '';
    const bodyWithMergeFields = replaceMergeFields(templateBody, mergeFields);
    const previewBody = formatEmailBody(bodyWithMergeFields);

    return {
      subject: opts?.subject || emailTemplate?.subject || '',
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
   * Check if a template ID is valid
   * @param template The template ID to check
   * @param type The type of template ('general', 'admin', 'contact') to narrow the check
   * @returns True if the template ID is valid for the given type (or any type if not specified)
   */
  isTemplateId(
    template: string,
    type?: EmailTemplateType
  ): template is EmailTemplateId {
    return (
      (template in generalEmailTemplates && (!type || type === 'general')) ||
      (template in adminEmailTemplates && (!type || type === 'admin')) ||
      (template in contactEmailTemplates && (!type || type === 'contact'))
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
  async findEmail(id: EmailTemplateId | string): Promise<Email | null> {
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

  /**
   * Enrich merge fields with standard fields (SUPPORTEMAIL, ORGNAME)
   * This ensures all templates have access to standard merge fields
   *
   * @param mergeFields Template-specific or custom merge fields
   * @returns Merge fields enriched with standard fields
   */
  private enrichMergeFields(mergeFields: EmailMergeFields): EmailMergeFields {
    return {
      ...getBaseEmailMergeFields(),
      ...mergeFields,
    };
  }

  /**
   * Convert a contact to an email recipient
   * This ensures all recipients have access to standard merge fields and contact merge fields
   *
   * @param contact The contact to convert
   * @param additionalMergeFields Additional merge fields to add to the contact
   * @returns Email recipient with standard merge fields and additional merge fields
   */
  private convertContactToRecipient(
    contact: Contact,
    additionalMergeFields?: EmailMergeFields
  ): EmailRecipient {
    return {
      to: { email: contact.email, name: contact.fullname },
      mergeFields: this.enrichMergeFields({
        ...getContactEmailMergeFields(contact),
        ...additionalMergeFields,
      }),
    };
  }
}

export const emailService = new EmailService();
export default emailService;
