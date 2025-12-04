import {
  EmailTemplateType,
  type GetEmailTemplateInfoData,
} from '@beabee/beabee-common';
import { Locale, isLocale } from '@beabee/locale';

import fs from 'fs';
import path from 'path';
import { IsNull, Not } from 'typeorm';
import { loadFront } from 'yaml-front-matter';

import config from '#config/config';
import {
  adminEmailTemplates,
  contactEmailTemplates,
  generalEmailTemplates,
  getBaseEmailMergeFields,
  getContactEmailMergeFields,
} from '#data/email-templates';
import { getRepository, runTransaction } from '#database';
import { log as mainLogger } from '#logging';
import { Contact, Email, EmailMailing } from '#models/index';
import { MandrillProvider, SMTPProvider, SendGridProvider } from '#providers';
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
      // Create a spoofed Email object for default templates
      // These are never saved to the database, so we set required fields manually
      const email = new Email();
      Object.assign(email, data);
      email.id = emailFile;
      email.body = body;
      email.date = new Date(0); // Epoch date for default templates
      email.templateId = null;

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
    params: GeneralEmailParams<T>,
    opts?: EmailOptions
  ): Promise<void> {
    const templateMergeFields = generalEmailTemplates[template].fn(
      params as any
    ); // https://github.com/microsoft/TypeScript/issues/30581
    const mergeFields = {
      ...getBaseEmailMergeFields(),
      ...templateMergeFields,
    };
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
      contactEmailTemplates[template].fn(contact, params as any) // https://github.com/microsoft/TypeScript/issues/30581
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
    params: AdminEmailParams<T>,
    opts?: EmailOptions
  ): Promise<void> {
    const templateMergeFields = adminEmailTemplates[template].fn(params as any);
    const recipient = {
      to: { email: OptionsService.getText('support-email') },
      mergeFields: {
        ...getBaseEmailMergeFields(),
        ...templateMergeFields,
      },
    };

    await this.sendTemplate(template, [recipient], opts, false);
  }

  /**
   * Internal method to send email templates
   *
   * Handles template resolution: database override or default template from .yfm files.
   * Called by sendTemplateTo, sendTemplateToContact, and sendTemplateToAdmin.
   *
   * **Template resolution:**
   * 1. Database override (Email with templateId)
   * 2. Default template from .yfm files
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
    // Check for override in database
    const email = await this.getTemplateEmail(template);

    if (email) {
      log.info('Sending template ' + template, { template, recipients });
      await this.sendEmail(email, recipients, opts);
    } else if (template === 'cancelled-contribution-no-survey') {
      // Fallback to cancelled contribution email if no no-survey variant
      await this.sendTemplate(
        'cancelled-contribution',
        recipients,
        opts,
        required
      );
    } else if (required) {
      log.error(`Tried to send ${template} that has no override or default`);
    }
  }

  /**
   * Get an email template (override or default)
   *
   * @param template The template ID
   * @returns The email template:
   *   - Override email if one exists (Email with templateId set)
   *   - Default template from .yfm files if no override and default exists
   *   - undefined if no override and no default exists
   */
  async getTemplateEmail(
    template: EmailTemplateId
  ): Promise<Email | undefined> {
    // Check for override in database
    const override = await getRepository(Email).findOneBy({
      templateId: template,
    });
    if (override) {
      return override;
    }

    // Fall back to default template if it exists
    const defaultEmail = this.getDefaultEmail(template);
    if (defaultEmail) {
      return defaultEmail;
    }

    // No override and no default template exists
    return undefined;
  }

  /**
   * Create or update a template override
   *
   * @param template The template ID
   * @param data The email data (subject, body)
   * @returns The created or updated email
   */
  async createOrUpdateTemplateOverride(
    template: EmailTemplateId,
    data: { subject: string; body: string }
  ): Promise<Email> {
    const existing = await getRepository(Email).findOneBy({
      templateId: template,
    });

    const email = existing || new Email();
    email.templateId = template;
    email.name = existing ? existing.name : `Override: ${template}`;
    email.subject = data.subject;
    email.body = data.body;

    return await getRepository(Email).save(email);
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
    // 1. Get the email template (override or default)
    const emailTemplate = opts?.templateId
      ? await this.getTemplateEmail(opts.templateId)
      : null;

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

  async deleteEmail(id: string): Promise<boolean> {
    const result = await runTransaction(async (em) => {
      await em.getRepository(EmailMailing).delete({ emailId: id });
      return await em.getRepository(Email).delete(id);
    });

    return result.affected == null || result.affected > 0;
  }

  /**
   * Delete a template email override (reset to default)
   * @param template The template ID
   * @returns true if an override was deleted, false if none existed
   */
  async deleteTemplateOverride(template: EmailTemplateId): Promise<boolean> {
    const override = await getRepository(Email).findOneBy({
      templateId: template,
    });
    if (override) {
      await getRepository(Email).delete(override.id);
      return true;
    }
    return false;
  }

  /**
   * Get metadata for all email templates with override and subject info
   * @returns Array of template metadata with type, merge fields, override status, and subject
   */
  async getTemplatesWithInfo(): Promise<GetEmailTemplateInfoData[]> {
    // Get all overrides from database
    const overrides = await getRepository(Email).find({
      where: { templateId: Not(IsNull()) },
      select: ['templateId', 'subject'],
    });
    const overrideMap = new Map(
      overrides.map((e) => [e.templateId, e.subject])
    );

    // Build template info list
    const allTemplates = [
      ...Object.entries(contactEmailTemplates).map(([id, def]) => ({
        id,
        metadata: {
          ...def.metadata,
          mergeFields: [...def.metadata.mergeFields],
        },
      })),
      ...Object.entries(generalEmailTemplates).map(([id, def]) => ({
        id,
        metadata: {
          ...def.metadata,
          mergeFields: [...def.metadata.mergeFields],
        },
      })),
      ...Object.entries(adminEmailTemplates).map(([id, def]) => ({
        id,
        metadata: {
          ...def.metadata,
          mergeFields: [...def.metadata.mergeFields],
        },
      })),
    ];

    return allTemplates.map(({ id, metadata }) => {
      const hasOverride = overrideMap.has(id);
      const overrideSubject = overrideMap.get(id);
      const defaultEmail = this.getDefaultEmail(id as EmailTemplateId);
      const hasDefaultTemplate = defaultEmail !== undefined;

      return {
        id,
        type: metadata.type,
        mergeFields: metadata.mergeFields,
        hasOverride,
        hasDefaultTemplate,
        subject: hasOverride ? overrideSubject! : (defaultEmail?.subject ?? ''),
      };
    });
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

  private getDefaultEmail(template: EmailTemplateId): Email | undefined {
    const locale = OptionsService.getText('locale');
    return (
      this.defaultEmails[locale]?.[template] ||
      this.defaultEmails.en?.[template]
    );
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
      mergeFields: {
        ...getBaseEmailMergeFields(),
        ...getContactEmailMergeFields(contact),
        ...additionalMergeFields,
      },
    };
  }
}

export const emailService = new EmailService();
export default emailService;
