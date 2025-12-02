import moment from 'moment';

import config from '#config/config';
import type { Contact } from '#models/index';
import OptionsService from '#services/OptionsService';
import type { EmailMergeFields } from '#type/index';

export const getContactEmailMergeFields = (contact: {
  email: string;
  fullname: string;
  firstname: string;
  lastname: string;
}) => ({
  EMAIL: contact.email,
  NAME: contact.fullname,
  FNAME: contact.firstname,
  LNAME: contact.lastname,
});

/**
 * Get standard merge fields that are available for all emails
 * These include organization-related fields that are commonly used
 *
 * @returns Standard merge fields (SUPPORTEMAIL, ORGNAME)
 */
export const getBaseEmailMergeFields = (): EmailMergeFields => ({
  SUPPORTEMAIL: OptionsService.getText('support-email'),
  ORGNAME: OptionsService.getText('organisation'),
});

/**
 * Email Merge Fields Documentation
 *
 * ## General Merge Fields (available for all contact emails)
 * - *|EMAIL|* - Contact's email address
 * - *|NAME|* - Contact's full name (first + last)
 * - *|FNAME|* - Contact's first name
 * - *|LNAME|* - Contact's last name
 *
 * ## Standard Merge Fields (available for all emails)
 * - *|SUPPORTEMAIL|* - Support email address
 * - *|ORGNAME|* - Organization name
 *
 * ## Magic Links (generated automatically)
 * - *|RPLINK|* - Reset password link
 * - *|LOGINLINK|* - Login link
 * - *|SPLINK|* - Set password link
 *
 */

/**
 * Unified email template definitions
 * Contains both the template function and metadata in a single structure
 * This ensures consistency and single source of truth
 */
export const emailTemplateDefinitions = {
  // Contact email templates
  contact: {
    welcome: {
      metadata: {
        type: 'contact' as const,
        mergeFields: ['REFCODE'],
      },
      fn: (contact: Contact) => ({
        REFCODE: contact.referralCode,
      }),
    },
    'welcome-post-gift': {
      metadata: {
        type: 'contact' as const,
        mergeFields: [],
      },
      fn: () => ({}),
    },
    'reset-password': {
      metadata: {
        type: 'contact' as const,
        mergeFields: ['RPLINK'],
      },
      fn: (_: Contact, params: { rpLink: string }) => ({
        RPLINK: params.rpLink,
      }),
    },
    'reset-device': {
      metadata: {
        type: 'contact' as const,
        mergeFields: ['RPLINK'],
      },
      fn: (_: Contact, params: { rpLink: string }) => ({
        RPLINK: params.rpLink,
      }),
    },
    'cancelled-contribution': {
      metadata: {
        type: 'contact' as const,
        mergeFields: ['EXPIRES', 'MEMBERSHIPID'],
      },
      fn: (contact: Contact) => ({
        EXPIRES: contact.membership?.dateExpires
          ? moment.utc(contact.membership.dateExpires).format('dddd Do MMMM')
          : '-',
        MEMBERSHIPID: contact.id,
      }),
    },
    'cancelled-contribution-no-survey': {
      metadata: {
        type: 'contact' as const,
        mergeFields: ['EXPIRES'],
      },
      fn: (contact: Contact) => {
        return {
          EXPIRES: contact.membership?.dateExpires
            ? moment.utc(contact.membership.dateExpires).format('dddd Do MMMM')
            : '-',
        };
      },
    },
    'manual-to-automatic': {
      metadata: {
        type: 'contact' as const,
        mergeFields: [],
      },
      fn: () => ({}),
    },
    'email-exists-login': {
      metadata: {
        type: 'contact' as const,
        mergeFields: ['LOGINLINK'],
      },
      fn: (_: Contact, params: { loginLink: string }) => ({
        LOGINLINK: params.loginLink,
      }),
    },
    'email-exists-set-password': {
      metadata: {
        type: 'contact' as const,
        mergeFields: ['SPLINK'],
      },
      fn: (_: Contact, params: { spLink: string }) => ({
        SPLINK: params.spLink,
      }),
    },
    'callout-response-answers': {
      metadata: {
        type: 'contact' as const,
        mergeFields: ['MESSAGE', 'CALLOUTTITLE', 'CALLOUTLINK'],
      },
      fn: (
        _: Contact,
        params: { calloutSlug: string; calloutTitle: string }
      ) => ({
        CALLOUTTITLE: params.calloutTitle,
        CALLOUTLINK: `${config.audience}/crowdnewsroom/${params.calloutSlug}`,
      }),
    },
    'successful-referral': {
      metadata: {
        type: 'contact' as const,
        mergeFields: ['REFCODE', 'REFEREENAME', 'ISELIGIBLE'],
      },
      fn: (
        contact: Contact,
        params: { refereeName: string; isEligible: boolean }
      ) => ({
        REFCODE: contact.referralCode,
        REFEREENAME: params.refereeName,
        ISELIGIBLE: params.isEligible,
      }),
    },
    'giftee-success': {
      metadata: {
        type: 'contact' as const,
        mergeFields: ['PURCHASER', 'MESSAGE', 'ACTIVATELINK'],
      },
      fn: (
        _: Contact,
        params: { fromName: string; message: string; giftCode: string }
      ) => ({
        PURCHASER: params.fromName,
        MESSAGE: params.message,
        ACTIVATELINK: config.audience + '/gift/' + params.giftCode,
      }),
    },
    'contribution-didnt-start': {
      metadata: {
        type: 'contact' as const,
        mergeFields: [],
      },
      fn: (_: Contact) => ({}),
    },
    'one-time-donation': {
      metadata: {
        type: 'contact' as const,
        mergeFields: ['AMOUNT'],
      },
      fn: (_: Contact, params: { amount: number }) => ({
        AMOUNT: config.currencySymbol + params.amount.toFixed(2),
      }),
    },
  },

  // General email templates
  general: {
    'purchased-gift': {
      metadata: {
        type: 'general' as const,
        mergeFields: ['PURCHASER', 'GIFTEE', 'GIFTDATE'],
      },
      fn: (params: {
        fromName: string;
        gifteeFirstName: string;
        giftStartDate: Date;
      }) => ({
        PURCHASER: params.fromName,
        GIFTEE: params.gifteeFirstName,
        GIFTDATE: moment.utc(params.giftStartDate).format('MMMM Do'),
      }),
    },
    'confirm-email': {
      metadata: {
        type: 'general' as const,
        mergeFields: ['FNAME', 'LNAME', 'CONFIRMLINK'],
      },
      fn: (params: {
        firstName: string;
        lastName: string;
        confirmLink: string;
      }) => ({
        FNAME: params.firstName,
        LNAME: params.lastName,
        CONFIRMLINK: params.confirmLink,
      }),
    },
    'expired-special-url-resend': {
      metadata: {
        type: 'general' as const,
        mergeFields: ['FNAME', 'URL'],
      },
      fn: (params: { firstName: string; newUrl: string }) => ({
        FNAME: params.firstName,
        URL: params.newUrl,
      }),
    },
  },

  // Admin email templates
  admin: {
    'new-member': {
      metadata: {
        type: 'admin' as const,
        mergeFields: ['MEMBERID', 'MEMBERNAME'],
      },
      fn: (params: { contact: Contact }) => ({
        MEMBERID: params.contact.id,
        MEMBERNAME: params.contact.fullname,
      }),
    },
    'cancelled-member': {
      metadata: {
        type: 'admin' as const,
        mergeFields: ['MEMBERID', 'MEMBERNAME'],
      },
      fn: (params: { contact: Contact }) => ({
        MEMBERID: params.contact.id,
        MEMBERNAME: params.contact.fullname,
      }),
    },
    'new-callout-response': {
      metadata: {
        type: 'admin' as const,
        mergeFields: ['CALLOUTSLUG', 'CALLOUTTITLE', 'RESPNAME'],
      },
      fn: (params: {
        calloutSlug: string;
        calloutTitle: string;
        responderName: string;
      }) => ({
        CALLOUTSLUG: params.calloutSlug,
        CALLOUTTITLE: params.calloutTitle,
        RESPNAME: params.responderName,
      }),
    },
  },
} as const;

/**
 * Extract template functions for backward compatibility
 * These are the original exports used throughout the codebase
 */
export const contactEmailTemplates = Object.fromEntries(
  Object.entries(emailTemplateDefinitions.contact).map(([key, value]) => [
    key,
    value.fn,
  ])
) as {
  [K in keyof typeof emailTemplateDefinitions.contact]: (typeof emailTemplateDefinitions.contact)[K]['fn'];
};

export const generalEmailTemplates = Object.fromEntries(
  Object.entries(emailTemplateDefinitions.general).map(([key, value]) => [
    key,
    value.fn,
  ])
) as {
  [K in keyof typeof emailTemplateDefinitions.general]: (typeof emailTemplateDefinitions.general)[K]['fn'];
};

export const adminEmailTemplates = Object.fromEntries(
  Object.entries(emailTemplateDefinitions.admin).map(([key, value]) => [
    key,
    value.fn,
  ])
) as {
  [K in keyof typeof emailTemplateDefinitions.admin]: (typeof emailTemplateDefinitions.admin)[K]['fn'];
};
