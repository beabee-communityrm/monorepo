import moment from 'moment';

import config from '#config/config';
import type { Contact } from '#models/index';
import OptionsService from '#services/OptionsService';

import type {
  EmailTemplateDefinition,
  GeneralEmailTemplateDefinition,
} from './email-template-definition';

/**
 * Email Merge Fields Documentation
 *
 * ## Base Contact Fields (automatically available for all contact templates)
 * - *|EMAIL|* - Contact's email address
 * - *|NAME|* - Contact's full name (first + last)
 * - *|FNAME|* - Contact's first name
 * - *|LNAME|* - Contact's last name
 *
 * ## Magic Links (generated automatically when used)
 * - *|RPLINK|* - Reset password link
 * - *|LOGINLINK|* - Login link
 * - *|SPLINK|* - Set password link
 * - *|ANSWERS|* - Formatted callout response answers
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
 * Each template includes explicit metadata (name, description, merge fields)
 */
export const generalEmailTemplates = {
  'purchased-gift': {
    name: 'Purchased Gift',
    description: 'Email sent when someone purchases a gift membership',
    mergeFields: ['PURCHASER', 'GIFTEE', 'GIFTDATE'],
    generator: (params: {
      fromName: string;
      gifteeFirstName: string;
      giftStartDate: Date;
    }) => ({
      PURCHASER: params.fromName,
      GIFTEE: params.gifteeFirstName,
      GIFTDATE: moment.utc(params.giftStartDate).format('MMMM Do'),
    }),
  } as GeneralEmailTemplateDefinition,

  'confirm-email': {
    name: 'Confirm Email',
    description: 'Email confirmation for new sign-ups',
    mergeFields: ['FNAME', 'LNAME', 'CONFIRMLINK'],
    generator: (params: {
      firstName: string;
      lastName: string;
      confirmLink: string;
    }) => ({
      FNAME: params.firstName,
      LNAME: params.lastName,
      CONFIRMLINK: params.confirmLink,
    }),
  } as GeneralEmailTemplateDefinition,

  'expired-special-url-resend': {
    name: 'Expired Special URL Resend',
    description:
      'Email sent when a special URL has expired and needs to be resent',
    mergeFields: ['FNAME', 'URL'],
    generator: (params: { firstName: string; newUrl: string }) => ({
      FNAME: params.firstName,
      URL: params.newUrl,
    }),
  } as GeneralEmailTemplateDefinition,
} as const;

/**
 * Admin email templates
 * These are emails sent to administrators
 * Each template includes explicit metadata (name, description, merge fields)
 */
export const adminEmailTemplates = {
  'new-member': {
    name: 'New Member',
    description: 'Email sent to admins when a new member joins',
    mergeFields: ['MEMBERID', 'MEMBERNAME'],
    generator: (params: { contact: Contact }) => ({
      MEMBERID: params.contact.id,
      MEMBERNAME: params.contact.fullname,
    }),
  } as GeneralEmailTemplateDefinition,

  'cancelled-member': {
    name: 'Cancelled Member',
    description: 'Email sent to admins when a member cancels their membership',
    mergeFields: ['MEMBERID', 'MEMBERNAME'],
    generator: (params: { contact: Contact }) => ({
      MEMBERID: params.contact.id,
      MEMBERNAME: params.contact.fullname,
    }),
  } as GeneralEmailTemplateDefinition,

  'new-callout-response': {
    name: 'New Callout Response',
    description: 'Email sent to admins when someone submits a callout response',
    mergeFields: ['CALLOUTSLUG', 'CALLOUTTITLE', 'RESPNAME'],
    generator: (params: {
      calloutSlug: string;
      calloutTitle: string;
      responderName: string;
    }) => ({
      CALLOUTSLUG: params.calloutSlug,
      CALLOUTTITLE: params.calloutTitle,
      RESPNAME: params.responderName,
    }),
  } as GeneralEmailTemplateDefinition,
} as const;

/**
 * Contact email templates
 * These are emails sent to contacts/members
 * Each template includes explicit metadata (name, description, merge fields)
 * Note: Base contact fields (EMAIL, NAME, FNAME, LNAME) are automatically available
 */
export const contactEmailTemplates = {
  welcome: {
    name: 'Welcome',
    description: 'Welcome email for new members',
    mergeFields: ['REFCODE'],
    generator: (contact: Contact) => ({
      REFCODE: contact.referralCode,
    }),
  } as EmailTemplateDefinition,

  'welcome-post-gift': {
    name: 'Welcome Post Gift',
    description: 'Welcome email sent after gift membership activation',
    mergeFields: [],
    generator: () => ({}),
  } as EmailTemplateDefinition,

  'reset-password': {
    name: 'Reset Password',
    description: 'Email for password reset with reset link',
    mergeFields: ['RPLINK'],
    generator: (_: Contact, params: { rpLink: string }) => ({
      RPLINK: params.rpLink,
    }),
  } as EmailTemplateDefinition,

  'reset-device': {
    name: 'Reset Device',
    description: 'Email for device reset with reset link',
    mergeFields: ['RPLINK'],
    generator: (_: Contact, params: { rpLink: string }) => ({
      RPLINK: params.rpLink,
    }),
  } as EmailTemplateDefinition,

  'cancelled-contribution': {
    name: 'Cancelled Contribution',
    description: 'Email sent when a member cancels their contribution',
    mergeFields: ['EXPIRES', 'MEMBERSHIPID'],
    generator: (contact: Contact) => ({
      EXPIRES: contact.membership?.dateExpires
        ? moment.utc(contact.membership.dateExpires).format('dddd Do MMMM')
        : '-',
      MEMBERSHIPID: contact.id,
    }),
  } as EmailTemplateDefinition,

  'cancelled-contribution-no-survey': {
    name: 'Cancelled Contribution (No Survey)',
    description: 'Email sent when a member cancels without completing survey',
    mergeFields: ['EXPIRES'],
    generator: (contact: Contact) => ({
      EXPIRES: contact.membership?.dateExpires
        ? moment.utc(contact.membership.dateExpires).format('dddd Do MMMM')
        : '-',
    }),
  } as EmailTemplateDefinition,

  'successful-referral': {
    name: 'Successful Referral',
    description: 'Email sent when someone successfully refers a new member',
    mergeFields: ['REFCODE', 'REFEREENAME', 'ISELIGIBLE'],
    generator: (
      contact: Contact,
      params: { refereeName: string; isEligible: boolean }
    ) => ({
      REFCODE: contact.referralCode,
      REFEREENAME: params.refereeName,
      ISELIGIBLE: params.isEligible,
    }),
  } as EmailTemplateDefinition,

  'giftee-success': {
    name: 'Gift Recipient Success',
    description: 'Email sent to gift recipient with activation link',
    mergeFields: ['PURCHASER', 'MESSAGE', 'ACTIVATELINK'],
    generator: (
      _: Contact,
      params: { fromName: string; message: string; giftCode: string }
    ) => ({
      PURCHASER: params.fromName,
      MESSAGE: params.message,
      ACTIVATELINK: config.audience + '/gift/' + params.giftCode,
    }),
  } as EmailTemplateDefinition,

  'manual-to-automatic': {
    name: 'Manual to Automatic',
    description:
      'Email sent when payment is converted from manual to automatic',
    mergeFields: [],
    generator: () => ({}),
  } as EmailTemplateDefinition,

  'email-exists-login': {
    name: 'Email Exists (Login)',
    description:
      'Email sent when someone tries to sign up with existing email (has password)',
    mergeFields: ['LOGINLINK'],
    generator: (_: Contact, params: { loginLink: string }) => ({
      LOGINLINK: params.loginLink,
    }),
  } as EmailTemplateDefinition,

  'email-exists-set-password': {
    name: 'Email Exists (Set Password)',
    description:
      'Email sent when someone tries to sign up with existing email (no password)',
    mergeFields: ['SPLINK'],
    generator: (_: Contact, params: { spLink: string }) => ({
      SPLINK: params.spLink,
    }),
  } as EmailTemplateDefinition,

  'callout-response-answers': {
    name: 'Callout Response Answers',
    description: 'Email with callout response answers sent to responder',
    mergeFields: [
      'MESSAGE',
      'CALLOUTTITLE',
      'CALLOUTLINK',
      'SUPPORTEMAIL',
      'ANSWERS',
    ],
    generator: (
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
  } as EmailTemplateDefinition,

  'contribution-didnt-start': {
    name: "Contribution Didn't Start",
    description: 'Email sent when a contribution payment fails to start',
    mergeFields: ['ORGNAME', 'SUPPORTEMAIL'],
    generator: (_: Contact) => ({
      ORGNAME: OptionsService.getText('organisation'),
      SUPPORTEMAIL: OptionsService.getText('support-email'),
    }),
  } as EmailTemplateDefinition,
} as const;
