import moment from 'moment';

import config from '#config/config';
import type { Contact } from '#models/index';
import OptionsService from '#services/OptionsService';
import {
  AdminEmailParams,
  AdminEmailTemplateId,
  ContactEmailParams,
  ContactEmailTemplateId,
  EmailMergeFields,
  EmailTemplateId,
  EmailTemplateParams,
  EmailTemplateType,
  GeneralEmailParams,
  GeneralEmailTemplateId,
} from '#type/email';

/**
 * Email Merge Fields Documentation
 *
 * ## General Merge Fields (available for all contact emails)
 * - *|EMAIL|* - Contact's email address
 * - *|NAME|* - Contact's full name (first + last)
 * - *|FNAME|* - Contact's first name
 * - *|LNAME|* - Contact's last name
 *
 * ## Magic Links (generated automatically)
 * - *|RPLINK|* - Reset password link
 * - *|LOGINLINK|* - Login link
 * - *|SPLINK|* - Set password link
 *
 * ## Nested Merge Fields
 * The MESSAGE field supports nested merge fields. For example:
 * - MESSAGE: "Hello *|FNAME|*, thank you for your response to *|CALLOUTTITLE|*!"
 * - This will expand to: "Hello John, thank you for your response to Survey 2024!"
 *
 * All merge fields within MESSAGE content are automatically expanded before rendering.
 */

class EmailTemplateService {
  /**
   * General email templates
   * These are emails sent for general purposes not specific to a contact
   */
  private readonly generalEmailTemplates = {
    /**
     * Email template for purchased gift memberships
     *
     * **Available Merge Fields:**
     * - *|PURCHASER|* - Name of the gift purchaser
     * - *|GIFTEE|* - First name of the gift recipient
     * - *|GIFTDATE|* - Gift start date (formatted as "Month Day")
     */
    'purchased-gift': (params: {
      fromName: string;
      gifteeFirstName: string;
      giftStartDate: Date;
    }) => ({
      PURCHASER: params.fromName,
      GIFTEE: params.gifteeFirstName,
      GIFTDATE: moment.utc(params.giftStartDate).format('MMMM Do'),
    }),
    /**
     * Email template for email confirmation
     *
     * **Available Merge Fields:**
     * - *|FNAME|* - First name
     * - *|LNAME|* - Last name
     * - *|CONFIRMLINK|* - Email confirmation link
     */
    'confirm-email': (params: {
      firstName: string;
      lastName: string;
      confirmLink: string;
    }) => ({
      FNAME: params.firstName,
      LNAME: params.lastName,
      CONFIRMLINK: params.confirmLink,
    }),
    /**
     * Email template for expired special URLs (resend)
     *
     * **Available Merge Fields:**
     * - *|FNAME|* - First name
     * - *|URL|* - New special URL
     */
    'expired-special-url-resend': (params: {
      firstName: string;
      newUrl: string;
    }) => ({
      FNAME: params.firstName,
      URL: params.newUrl,
    }),
  } as const;

  /**
   * Admin email templates
   * These are emails sent to administrators
   */
  private readonly adminEmailTemplates = {
    /**
     * Email template for new members (to admins)
     *
     * **Available Merge Fields:**
     * - *|MEMBERID|* - Contact ID of the new member
     * - *|MEMBERNAME|* - Full name of the new member
     */
    'new-member': (params: { contact: Contact }) => ({
      MEMBERID: params.contact.id,
      MEMBERNAME: params.contact.fullname,
    }),
    /**
     * Email template for cancelled members (to admins)
     *
     * **Available Merge Fields:**
     * - *|MEMBERID|* - Contact ID of the cancelled member
     * - *|MEMBERNAME|* - Full name of the cancelled member
     */
    'cancelled-member': (params: { contact: Contact }) => ({
      MEMBERID: params.contact.id,
      MEMBERNAME: params.contact.fullname,
    }),
    /**
     * Email template for new callout responses (to admins)
     *
     * **Available Merge Fields:**
     * - *|CALLOUTSLUG|* - Slug of the callout
     * - *|CALLOUTTITLE|* - Title of the callout
     * - *|RESPNAME|* - Name of the responder
     */
    'new-callout-response': (params: {
      calloutSlug: string;
      calloutTitle: string;
      responderName: string;
    }) => ({
      CALLOUTSLUG: params.calloutSlug,
      CALLOUTTITLE: params.calloutTitle,
      RESPNAME: params.responderName,
    }),
  } as const;

  /**
   * Contact email templates
   * These are emails sent to contacts/members
   */
  private readonly contactEmailTemplates = {
    /**
     * Welcome email for new members
     *
     * **Available Merge Fields:**
     * - *|REFCODE|* - Contact's referral code
     */
    welcome: (params: { contact: Contact }) => ({
      REFCODE: params.contact.referralCode,
    }),
    /**
     * Welcome email after gift membership
     *
     * **Available Merge Fields:**
     * - Only the general contact merge fields
     */
    'welcome-post-gift': (params: { contact: Contact }) => ({}),
    /**
     * Email for password reset
     *
     * **Available Merge Fields:**
     * - *|RPLINK|* - Reset password link
     */
    'reset-password': (params: { contact: Contact; rpLink: string }) => ({
      RPLINK: params.rpLink,
    }),
    /**
     * Email for device reset
     *
     * **Available Merge Fields:**
     * - *|RPLINK|* - Reset device link
     */
    'reset-device': (params: { contact: Contact; rpLink: string }) => ({
      RPLINK: params.rpLink,
    }),
    /**
     * Email for contribution cancellation
     *
     * **Available Merge Fields:**
     * - *|EXPIRES|* - Membership expiration date (formatted as "Day Date Month")
     * - *|MEMBERSHIPID|* - Contact/membership ID
     */
    'cancelled-contribution': (params: { contact: Contact }) => ({
      EXPIRES: params.contact.membership?.dateExpires
        ? moment
            .utc(params.contact.membership.dateExpires)
            .format('dddd Do MMMM')
        : '-',
      MEMBERSHIPID: params.contact.id,
    }),
    /**
     * Email for contribution cancellation without survey
     *
     * **Available Merge Fields:**
     * - *|EXPIRES|* - Membership expiration date (formatted as "Day Date Month")
     */
    'cancelled-contribution-no-survey': (params: { contact: Contact }) => {
      return {
        EXPIRES: params.contact.membership?.dateExpires
          ? moment
              .utc(params.contact.membership.dateExpires)
              .format('dddd Do MMMM')
          : '-',
      };
    },
    /**
     * Email for successful referral
     *
     * **Available Merge Fields:**
     * - *|REFCODE|* - Contact's referral code
     * - *|REFEREENAME|* - Name of the referred person
     * - *|ISELIGIBLE|* - Whether the referral is eligible
     */
    'successful-referral': (params: {
      contact: Contact;
      refereeName: string;
      isEligible: boolean;
    }) => ({
      REFCODE: params.contact.referralCode,
      REFEREENAME: params.refereeName,
      ISELIGIBLE: params.isEligible,
    }),
    /**
     * Email for successful gift activation (to recipient)
     *
     * **Available Merge Fields:**
     * - *|PURCHASER|* - Name of the gift purchaser
     * - *|MESSAGE|* - Personal message from the purchaser (supports nested merge fields)
     * - *|ACTIVATELINK|* - Link to activate the gift
     */
    'giftee-success': (params: {
      contact: Contact;
      fromName: string;
      message: string;
      giftCode: string;
    }) => ({
      PURCHASER: params.fromName,
      MESSAGE: params.message,
      ACTIVATELINK: config.audience + '/gift/' + params.giftCode,
    }),
    /**
     * Email for conversion from manual to automatic
     *
     * **Available Merge Fields:**
     * - Only the general contact merge fields
     */
    'manual-to-automatic': (params: { contact: Contact }) => ({}),
    /**
     * Email when email already exists (login)
     *
     * **Available Merge Fields:**
     * - *|LOGINLINK|* - Login link
     */
    'email-exists-login': (params: {
      contact: Contact;
      loginLink: string;
    }) => ({
      LOGINLINK: params.loginLink,
    }),
    /**
     * Email when email already exists (set password)
     *
     * **Available Merge Fields:**
     * - *|SPLINK|* - Set password link
     */
    'email-exists-set-password': (params: {
      contact: Contact;
      spLink: string;
    }) => ({
      SPLINK: params.spLink,
    }),
    /**
     * Email with callout response answers
     *
     * **Available Merge Fields:**
     * - *|MESSAGE|* - Custom message (supports nested merge fields)
     * - *|CALLOUTTITLE|* - Title of the callout
     * - *|CALLOUTLINK|* - Link to the callout
     * - *|SUPPORTEMAIL|* - Support email address
     */
    'callout-response-answers': (params: {
      contact: Contact;
      message: string;
      calloutSlug: string;
      calloutTitle: string;
    }) => ({
      MESSAGE: params.message,
      CALLOUTTITLE: params.calloutTitle,
      CALLOUTLINK: `${config.audience}/crowdnewsroom/${params.calloutSlug}`,
      SUPPORTEMAIL: OptionsService.getText('support-email'),
    }),
    /**
     * Email when contribution didn't start
     *
     * **Available Merge Fields:**
     * - *|ORGNAME|* - Organization name
     * - *|SUPPORTEMAIL|* - Support email address
     */
    'contribution-didnt-start': (params: { contact: Contact }) => ({
      ORGNAME: OptionsService.getText('organisation'),
      SUPPORTEMAIL: OptionsService.getText('support-email'),
    }),
  } as const;
  /**
   * Get general email templates
   */
  getGeneralTemplates() {
    return this.generalEmailTemplates;
  }

  /**
   * Get admin email templates
   */
  getAdminTemplates() {
    return this.adminEmailTemplates;
  }

  /**
   * Get contact email templates
   */
  getContactTemplates() {
    return this.contactEmailTemplates;
  }

  /**
   * Check if a template ID is a general email template
   */
  isGeneral(
    template: string | EmailTemplateId
  ): template is GeneralEmailTemplateId {
    return (
      typeof template === 'string' && template in this.generalEmailTemplates
    );
  }

  /**
   * Check if a template ID is an admin email template
   */
  isAdmin(
    template: string | EmailTemplateId
  ): template is AdminEmailTemplateId {
    return typeof template === 'string' && template in this.adminEmailTemplates;
  }

  /**
   * Check if a template ID is a contact email template
   */
  isContact(
    template: string | EmailTemplateId
  ): template is ContactEmailTemplateId {
    return (
      typeof template === 'string' && template in this.contactEmailTemplates
    );
  }

  /**
   * Check if a string is a valid email template ID
   */
  isTemplate(template: string | EmailTemplateId): template is EmailTemplateId {
    return (
      this.isGeneral(template) ||
      this.isAdmin(template) ||
      this.isContact(template)
    );
  }

  /**
   * Determine the template type from a template ID
   * @param template The template ID
   * @returns The template type (general, admin, or contact)
   */
  getType(template: string | EmailTemplateId): EmailTemplateType | null {
    if (this.isGeneral(template)) {
      return 'general';
    } else if (this.isAdmin(template)) {
      return 'admin';
    } else if (this.isContact(template)) {
      return 'contact';
    }
    return null;
  }

  /**
   * Get merge fields for an email template
   * Generic method with overloads for type safety
   * For preview purposes, params can be optional (will use empty object as fallback)
   */
  getMergeFields<T extends ContactEmailTemplateId>(
    template: T,
    params?: ContactEmailParams<T>
  ): EmailMergeFields;
  getMergeFields<T extends AdminEmailTemplateId>(
    template: T,
    params?: AdminEmailParams<T>
  ): EmailMergeFields;
  getMergeFields<T extends GeneralEmailTemplateId>(
    template: T,
    params?: GeneralEmailParams<T>
  ): EmailMergeFields;
  getMergeFields<T extends EmailTemplateId>(
    template: T,
    params?:
      | ContactEmailParams<T & ContactEmailTemplateId>
      | AdminEmailParams<T & AdminEmailTemplateId>
      | GeneralEmailParams<T & GeneralEmailTemplateId>
  ): EmailMergeFields {
    try {
      let templateFn: (params: unknown) => EmailMergeFields;

      if (this.isContact(template)) {
        templateFn = this.contactEmailTemplates[template] as (
          params: unknown
        ) => EmailMergeFields;
        return templateFn(
          (params ?? {}) as ContactEmailParams<T & ContactEmailTemplateId>
        );
      } else if (this.isAdmin(template)) {
        templateFn = this.adminEmailTemplates[template] as (
          params: unknown
        ) => EmailMergeFields;
        return templateFn(
          (params ?? {}) as AdminEmailParams<T & AdminEmailTemplateId>
        );
      } else if (this.isGeneral(template)) {
        templateFn = this.generalEmailTemplates[template] as (
          params: unknown
        ) => EmailMergeFields;
        return templateFn(
          (params ?? {}) as GeneralEmailParams<T & GeneralEmailTemplateId>
        );
      }
    } catch (error) {
      // If template requires params we don't have, return empty fields
      // Frontend-provided mergeFields will override these anyway
      return {};
    }

    return {};
  }
}

export const emailTemplateService = new EmailTemplateService();
