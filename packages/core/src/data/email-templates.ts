import { EmailTemplateType } from '@beabee/beabee-common';

import moment from 'moment';

import config from '#config/config';
import type { Contact } from '#models/index';
import OptionsService from '#services/OptionsService';
import { EmailTemplate } from '#type/email';

/**
 * Email Merge Fields Documentation
 *
 * ## Magic Links (generated automatically)
 * - *|RPLINK|* - Reset password link
 * - *|LOGINLINK|* - Login link
 * - *|SPLINK|* - Set password link
 */

/**
 * Get standard contact merge fields that are available for all contact emails
 *
 * - *|EMAIL|* - Contact's email address
 * - *|NAME|* - Contact's full name (first + last)
 * - *|FNAME|* - Contact's first name
 * - *|LNAME|* - Contact's last name
 
  * @param contact - The contact to get merge fields for
  * @returns Standard contact merge fields
 */
export const getContactEmailMergeFields = (contact: Contact) => ({
  EMAIL: contact.email,
  NAME: contact.fullname,
  FNAME: contact.firstname,
  LNAME: contact.lastname,
});

/**
 * Get standard merge fields that are available for all emails
 * These include organization-related fields that are commonly used
 *
 * - *|SUPPORTEMAIL|* - Support email address
 * - *|ORGNAME|* - Organization name
 *
 * @returns Standard merge fields (SUPPORTEMAIL, ORGNAME)
 */
export const getBaseEmailMergeFields = () => ({
  SUPPORTEMAIL: OptionsService.getText('support-email'),
  ORGNAME: OptionsService.getText('organisation'),
});

/**
 * A helper to create an email template with merge fields and function
 * with proper typing
 *
 * @param mergeFields The list of merge fields
 * @param fn The function to generate merge field values
 * @returns An email template
 */
function withMergeFields<T extends string, A extends any[]>(
  mergeFields: readonly T[],
  fn: (...args: A) => { [key in T]: string }
): EmailTemplate<T, A> {
  return { mergeFields, fn };
}

/**
 * Contact email templates
 * Each template contains both the function and metadata
 */
export const contactEmailTemplates = {
  welcome: withMergeFields(['REFCODE'], (contact: Contact) => ({
    REFCODE: contact.referralCode || '',
  })),
  'welcome-post-gift': withMergeFields([], () => ({})),
  'reset-password': withMergeFields(
    ['RPLINK'],
    (_: Contact, params: { rpLink: string }) => ({
      RPLINK: params.rpLink,
    })
  ),
  'reset-device': withMergeFields(
    ['RPLINK'],
    (_: Contact, params: { rpLink: string }) => ({
      RPLINK: params.rpLink,
    })
  ),
  'cancelled-contribution': withMergeFields(
    ['EXPIRES', 'MEMBERSHIPID'],
    (contact: Contact) => ({
      EXPIRES: contact.membership?.dateExpires
        ? moment.utc(contact.membership.dateExpires).format('dddd Do MMMM')
        : '-',
      MEMBERSHIPID: contact.id,
    })
  ),
  'cancelled-contribution-no-survey': withMergeFields(
    ['EXPIRES'],
    (contact: Contact) => ({
      EXPIRES: contact.membership?.dateExpires
        ? moment.utc(contact.membership.dateExpires).format('dddd Do MMMM')
        : '-',
    })
  ),
  'manual-to-automatic': withMergeFields([], () => ({})),
  'email-exists-login': withMergeFields(
    ['LOGINLINK'],
    (_: Contact, params: { loginLink: string }) => ({
      LOGINLINK: params.loginLink,
    })
  ),
  'email-exists-set-password': withMergeFields(
    ['SPLINK'],
    (_: Contact, params: { spLink: string }) => ({
      SPLINK: params.spLink,
    })
  ),
  'callout-response-answers': withMergeFields(
    ['MESSAGE', 'CALLOUTTITLE', 'CALLOUTLINK', 'CALLOUTSLUG'],
    (_: Contact, params: { calloutSlug: string; calloutTitle: string }) => ({
      CALLOUTSLUG: params.calloutSlug,
      CALLOUTTITLE: params.calloutTitle,
      CALLOUTLINK: `${config.audience}/crowdnewsroom/${params.calloutSlug}`,
      MESSAGE: '',
    })
  ),
  'successful-referral': withMergeFields(
    ['REFCODE', 'REFEREENAME', 'ISELIGIBLE'],
    (
      contact: Contact,
      params: { refereeName: string; isEligible: boolean }
    ) => ({
      REFCODE: contact.referralCode || '',
      REFEREENAME: params.refereeName,
      ISELIGIBLE: params.isEligible.toString(),
    })
  ),
  'giftee-success': withMergeFields(
    ['PURCHASER', 'MESSAGE', 'ACTIVATELINK'],
    (
      _: Contact,
      params: { fromName: string; message: string; giftCode: string }
    ) => ({
      PURCHASER: params.fromName,
      MESSAGE: params.message,
      ACTIVATELINK: config.audience + '/gift/' + params.giftCode,
    })
  ),
  'contribution-didnt-start': withMergeFields([], (_: Contact) => ({})),
  'one-time-donation': withMergeFields(
    ['AMOUNT'],
    (_: Contact, params: { amount: number }) => ({
      AMOUNT: config.currencySymbol + params.amount.toFixed(2),
    })
  ),
  'one-time-donation-failed': withMergeFields(
    ['AMOUNT'],
    (_: Contact, params: { amount: number }) => ({
      AMOUNT: config.currencySymbol + params.amount.toFixed(2),
    })
  ),
} as const;

/**
 * General email templates
 * Each template contains both the function and metadata
 */
export const generalEmailTemplates = {
  'purchased-gift': withMergeFields(
    ['PURCHASER', 'GIFTEE', 'GIFTDATE'],
    (params: {
      fromName: string;
      gifteeFirstName: string;
      giftStartDate: Date;
    }) => ({
      PURCHASER: params.fromName,
      GIFTEE: params.gifteeFirstName,
      GIFTDATE: moment.utc(params.giftStartDate).format('MMMM Do'),
    })
  ),
  'confirm-email': withMergeFields(
    ['FNAME', 'LNAME', 'CONFIRMLINK'],
    (params: { firstName: string; lastName: string; confirmLink: string }) => ({
      FNAME: params.firstName,
      LNAME: params.lastName,
      CONFIRMLINK: params.confirmLink,
    })
  ),
  'setup-account': withMergeFields(
    ['FNAME', 'LNAME', 'CONFIRMLINK'],
    (params: { firstName: string; lastName: string; confirmLink: string }) => ({
      FNAME: params.firstName,
      LNAME: params.lastName,
      CONFIRMLINK: params.confirmLink,
    })
  ),
  'expired-special-url-resend': withMergeFields(
    ['FNAME', 'URL'],
    (params: { firstName: string; newUrl: string }) => ({
      FNAME: params.firstName,
      URL: params.newUrl,
    })
  ),
} as const;

/**
 * Admin email templates
 * Each template contains both the function and metadata
 */
export const adminEmailTemplates = {
  'new-member': withMergeFields(
    ['MEMBERID', 'MEMBERNAME'],
    (params: { contact: Contact }) => ({
      MEMBERID: params.contact.id,
      MEMBERNAME: params.contact.fullname,
    })
  ),
  'cancelled-member': withMergeFields(
    ['MEMBERID', 'MEMBERNAME'],
    (params: { contact: Contact }) => ({
      MEMBERID: params.contact.id,
      MEMBERNAME: params.contact.fullname,
    })
  ),
  'new-callout-response': withMergeFields(
    ['CALLOUTSLUG', 'CALLOUTTITLE', 'RESPNAME'],
    (params: {
      calloutSlug: string;
      calloutTitle: string;
      responderName: string;
    }) => ({
      CALLOUTSLUG: params.calloutSlug,
      CALLOUTTITLE: params.calloutTitle,
      RESPNAME: params.responderName,
    })
  ),
} as const;

export const allEmailTemplates = [
  ['general', generalEmailTemplates],
  ['admin', adminEmailTemplates],
  ['contact', contactEmailTemplates],
] as const;
