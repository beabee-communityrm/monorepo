import moment from 'moment';

import config from '#config/config';
import type { Contact } from '#models/index';
import OptionsService from '#services/OptionsService';

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

/**
 * General email templates
 * These are emails sent for general purposes not specific to a contact
 */
export const generalEmailTemplates = {
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
export const adminEmailTemplates = {
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
export const contactEmailTemplates = {
  /**
   * Welcome email for new members
   *
   * **Available Merge Fields:**
   * - *|REFCODE|* - Contact's referral code
   */
  welcome: (contact: Contact) => ({
    REFCODE: contact.referralCode,
  }),
  /**
   * Welcome email after gift membership
   *
   * **Available Merge Fields:**
   * - Only the general contact merge fields
   */
  'welcome-post-gift': () => ({}),
  /**
   * Email for password reset
   *
   * **Available Merge Fields:**
   * - *|RPLINK|* - Reset password link
   */
  'reset-password': (_: Contact, params: { rpLink: string }) => ({
    RPLINK: params.rpLink,
  }),
  /**
   * Email for device reset
   *
   * **Available Merge Fields:**
   * - *|RPLINK|* - Reset device link
   */
  'reset-device': (_: Contact, params: { rpLink: string }) => ({
    RPLINK: params.rpLink,
  }),
  /**
   * Email for contribution cancellation
   *
   * **Available Merge Fields:**
   * - *|EXPIRES|* - Membership expiration date (formatted as "Day Date Month")
   * - *|MEMBERSHIPID|* - Contact/membership ID
   */
  'cancelled-contribution': (contact: Contact) => ({
    EXPIRES: contact.membership?.dateExpires
      ? moment.utc(contact.membership.dateExpires).format('dddd Do MMMM')
      : '-',
    MEMBERSHIPID: contact.id,
  }),
  /**
   * Email for contribution cancellation without survey
   *
   * **Available Merge Fields:**
   * - *|EXPIRES|* - Membership expiration date (formatted as "Day Date Month")
   */
  'cancelled-contribution-no-survey': (contact: Contact) => {
    return {
      EXPIRES: contact.membership?.dateExpires
        ? moment.utc(contact.membership.dateExpires).format('dddd Do MMMM')
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
  'successful-referral': (
    contact: Contact,
    params: { refereeName: string; isEligible: boolean }
  ) => ({
    REFCODE: contact.referralCode,
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
  'giftee-success': (
    _: Contact,
    params: { fromName: string; message: string; giftCode: string }
  ) => ({
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
  'manual-to-automatic': () => ({}),
  /**
   * Email when email already exists (login)
   *
   * **Available Merge Fields:**
   * - *|LOGINLINK|* - Login link
   */
  'email-exists-login': (_: Contact, params: { loginLink: string }) => ({
    LOGINLINK: params.loginLink,
  }),
  /**
   * Email when email already exists (set password)
   *
   * **Available Merge Fields:**
   * - *|SPLINK|* - Set password link
   */
  'email-exists-set-password': (_: Contact, params: { spLink: string }) => ({
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
   * - *|ANSWERS|* - Formatted response answers (HTML)
   */
  'callout-response-answers': (
    _: Contact,
    params: {
      message: string;
      calloutSlug: string;
      calloutTitle: string;
      answers?: string;
    }
  ) => ({
    MESSAGE: params.message,
    CALLOUTTITLE: params.calloutTitle,
    CALLOUTLINK: `${config.audience}/crowdnewsroom/${params.calloutSlug}`,
    SUPPORTEMAIL: OptionsService.getText('support-email'),
    ANSWERS: params.answers || '',
  }),
  /**
   * Email when contribution didn't start
   *
   * **Available Merge Fields:**
   * - *|ORGNAME|* - Organization name
   * - *|SUPPORTEMAIL|* - Support email address
   */
  'contribution-didnt-start': (_: Contact) => ({
    ORGNAME: OptionsService.getText('organisation'),
    SUPPORTEMAIL: OptionsService.getText('support-email'),
  }),
} as const;
