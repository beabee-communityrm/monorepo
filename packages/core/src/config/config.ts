/**
 * Application configuration module
 *
 * This module reads environment variables to create a strongly-typed configuration
 * object used throughout the application. All environment variables are prefixed with
 * BEABEE_ to avoid conflicts with other applications.
 */
import type {
  DocumentServiceConfig,
  ImageServiceConfig,
  S3Config,
} from '../type/index';
import * as env from './env';

/**
 * SMTP email provider configuration
 * Used when BEABEE_EMAIL_PROVIDER=smtp
 */
export interface SMTPEmailConfig {
  provider: 'smtp';
  settings: {
    host: string; // BEABEE_EMAIL_SETTINGS_HOST - SMTP server address
    port: number; // BEABEE_EMAIL_SETTINGS_PORT - SMTP server port
    secure: boolean; // BEABEE_EMAIL_SETTINGS_SECURE - Whether to use SSL/TLS (default: false)
    auth: {
      user: string; // BEABEE_EMAIL_SETTINGS_AUTH_USER - SMTP username
      pass: string; // BEABEE_EMAIL_SETTINGS_AUTH_PASS - SMTP password
    };
  };
}

/**
 * Mandrill email provider configuration
 * Used when BEABEE_EMAIL_PROVIDER=mandrill
 */
export interface MandrillEmailConfig {
  provider: 'mandrill';
  settings: {
    apiKey: string; // BEABEE_EMAIL_SETTINGS_APIKEY - Mandrill API key
  };
}

/**
 * SendGrid email provider configuration
 * Used when BEABEE_EMAIL_PROVIDER=sendgrid
 */
export interface SendGridEmailConfig {
  provider: 'sendgrid';
  settings: {
    apiKey: string; // BEABEE_EMAIL_SETTINGS_APIKEY - SendGrid API key
    testMode: boolean; // BEABEE_EMAIL_SETTIGS_TESTMODE - Enable test mode (default: false)
  };
}

// Union type for email configuration - only one provider can be used at a time
type EmailConfig = SMTPEmailConfig | MandrillEmailConfig | SendGridEmailConfig;

// Get email provider from environment, with validation for allowed values
const emailProvider = env.e('BEABEE_EMAIL_PROVIDER', [
  'mandrill',
  'sendgrid',
  'smtp',
] as const);

/**
 * Mailchimp newsletter provider configuration
 * Used when BEABEE_NEWSLETTER_PROVIDER=mailchimp
 */
export interface MailchimpNewsletterConfig {
  provider: 'mailchimp';
  settings: {
    apiKey: string; // BEABEE_NEWSLETTER_SETTINGS_APIKEY - Mailchimp API key
    datacenter: string; // BEABEE_NEWSLETTER_SETTINGS_DATACENTER - Mailchimp datacenter (e.g., us1)
    listId: string; // BEABEE_NEWSLETTER_SETTINGS_LISTID - Mailchimp list/audience ID
    webhookSecret: string; // BEABEE_NEWSLETTER_SETTINGS_WEBHOOKSECRET - Secret for validating Mailchimp webhooks
  };
}

/**
 * Empty newsletter provider (when newsletter functionality is disabled)
 * Used when BEABEE_NEWSLETTER_PROVIDER=none (default)
 */
interface NoneNewsletterConfig {
  provider: 'none';
  settings: {
    webhookSecret: string; // BEABEE_NEWSLETTER_SETTINGS_WEBHOOKSECRET - Still available but unused
  };
}

// Union type for newsletter configuration
type NewsletterConfig = MailchimpNewsletterConfig | NoneNewsletterConfig;

// Get newsletter provider from environment, with validation for allowed values
// Defaults to "none" if not specified
const newsletterProvider = env.e(
  'BEABEE_NEWSLETTER_PROVIDER',
  ['mailchimp', 'none'] as const,
  'none'
);

/**
 * Application configuration for an individual app module
 * Used for dynamic app loading and menu building
 */
export interface AppConfig {
  uid: string; // Unique identifier for the app
  title: string; // Display name for the app
  path: string; // URL path for the app
  disabled: boolean; // Whether the app is currently disabled
  priority: number; // Order priority for menu display
  appPath: string; // File system path to the app
  hidden?: boolean; // Whether to hide the app from menus
  subApps: AppConfig[]; // Nested sub-applications
  menu: 'none' | 'main'; // Which menu this app should appear in
  permissions: string[]; // Required permissions to access this app
}

/**
 * Type for overriding app configurations through environment variables
 * Used with BEABEE_APPOVERRIDES env var
 */
export type AppConfigOverrides = Record<string, AppConfigOverride>;

export interface AppConfigOverride {
  config?: Partial<AppConfig>; // Partial app config to override properties
  subApps?: AppConfigOverrides; // Override sub-apps config
}

const s3: S3Config = {
  endpoint: env.s('BEABEE_MINIO_ENDPOINT'), // MinIO/S3 endpoint URL
  region: env.s('BEABEE_MINIO_REGION', 'us-east-1'), // MinIO/S3 region
  accessKey: env.s('BEABEE_MINIO_ROOT_USER'), // MinIO/S3 access key (root user)
  secretKey: env.s('BEABEE_MINIO_ROOT_PASSWORD'), // MinIO/S3 secret key (root password)
  bucket: env.s('BEABEE_MINIO_BUCKET'), // MinIO/S3 bucket for uploads
  forcePathStyle: env.b('BEABEE_MINIO_FORCE_PATH_STYLE', true), // Force path style URLs for S3 compatibility
};

// Image service configuration
const image: ImageServiceConfig = {
  quality: env.n('BEABEE_IMAGE_QUALITY', 80), // Quality level for image compression (default: 80)
  format: env.e(
    'BEABEE_IMAGE_FORMAT',
    ['avif', 'webp', 'jpeg', 'png', 'original'] as const, // Allowed image formats
    'avif' // Default: avif
  ),
  availableWidths: env.nn(
    'BEABEE_IMAGE_AVAILABLE_WIDTHS',
    [100, 300, 400, 600, 900, 1200, 1440, 1800]
  ), // Supported widths for image resizing
  s3,
};

const document: DocumentServiceConfig = {
  s3,
};

/**
 * Main application configuration object
 * Contains all settings derived from environment variables
 */
export const config = {
  // Core authentication settings
  audience: env.s('BEABEE_AUDIENCE'), // Public URL of the instance
  dev: env.b('BEABEE_DEV'), // Development mode flag
  secret: env.s('BEABEE_SECRET'), // Secret for session signing and data encryption
  serviceSecret: env.s('BEABEE_SERVICE_SECRET'), // Secret for internal service authentication
  session: env.s('BEABEE_SESSION', 'session'), // Session identifier (default: "session")

  // Cookie settings for authentication
  cookie: {
    domain: env.s('BEABEE_COOKIE_DOMAIN'), // Cookie domain (e.g., localhost)
    secure: env.b('BEABEE_COOKIE_SECURE', true), // Require HTTPS for cookies (default: true)
  },

  // CORS and security settings
  trustedOrigins: env.ss('BEABEE_TRUSTEDORIGINS', []), // Origins allowed to make authenticated requests

  // Database connection
  databaseUrl: env.s('BEABEE_DATABASE_URL'), // PostgreSQL connection URL

  // CaptchaFox integration for bot protection
  captchaFox: {
    secret: env.s('BEABEE_CAPTCHAFOX_SECRET', ''), // CaptchaFox secret key (default: empty)
  },

  // Discourse forum integration
  discourse: {
    url: env.s('BEABEE_DISCOURSE_URL', ''), // Discourse forum URL (default: empty)
    ssoSecret: env.s('BEABEE_DISCOURSE_SSOSECRET', ''), // Discourse SSO secret (default: empty)
  },

  // Email delivery configuration
  email: {
    provider: emailProvider, // Email provider type (smtp, mandrill, sendgrid)
    settings:
      emailProvider === 'smtp'
        ? {
            host: env.s('BEABEE_EMAIL_SETTINGS_HOST'), // SMTP server address
            port: env.s('BEABEE_EMAIL_SETTINGS_PORT'), // SMTP server port
            secure: env.b('BEABEE_EMAIL_SETTINGS_SECURE', false), // Use SSL/TLS (default: false)
            auth: {
              user: env.s('BEABEE_EMAIL_SETTINGS_AUTH_USER'), // SMTP username
              pass: env.s('BEABEE_EMAIL_SETTINGS_AUTH_PASS'), // SMTP password
            },
          }
        : emailProvider === 'mandrill'
          ? {
              apiKey: env.s('BEABEE_EMAIL_SETTINGS_APIKEY'), // Mandrill API key
            }
          : {
              apiKey: env.s('BEABEE_EMAIL_SETTINGS_APIKEY'), // SendGrid API key
              testMode: env.b('BEABEE_EMAIL_SETTIGS_TESTMODE', false), // SendGrid test mode (default: false)
            },
  } as EmailConfig,

  // Newsletter integration configuration
  newsletter: {
    provider: newsletterProvider, // Newsletter provider (mailchimp or none)
    settings: {
      webhookSecret: env.s('BEABEE_NEWSLETTER_SETTINGS_WEBHOOKSECRET', ''), // Secret for validating webhooks
      ...(newsletterProvider === 'mailchimp'
        ? {
            apiKey: env.s('BEABEE_NEWSLETTER_SETTINGS_APIKEY'), // Mailchimp API key
            datacenter: env.s('BEABEE_NEWSLETTER_SETTINGS_DATACENTER'), // Mailchimp datacenter
            listId: env.s('BEABEE_NEWSLETTER_SETTINGS_LISTID'), // Mailchimp list/audience ID
          }
        : null),
    },
  } as NewsletterConfig,

  // GoCardless payment integration
  gocardless: {
    accessToken: env.s('BEABEE_GOCARDLESS_ACCESSTOKEN', ''), // GoCardless API token (default: empty)
    secret: env.s('BEABEE_GOCARDLESS_SECRET', ''), // GoCardless webhook secret (default: empty)
    sandbox: env.b('BEABEE_GOCARDLESS_SANDBOX', true), // Use GoCardless sandbox (default: true)
  },

  // Stripe payment integration
  stripe: {
    publicKey: env.s('BEABEE_STRIPE_PUBLICKEY', ''), // Stripe publishable key (default: empty)
    secretKey: env.s('BEABEE_STRIPE_SECRETKEY', ''), // Stripe secret key (default: empty)
    webhookSecret: env.s('BEABEE_STRIPE_WEBHOOKSECRET', ''), // Stripe webhook signing secret (default: empty)
    membershipProductId: env.s('BEABEE_STRIPE_MEMBERSHIPPRODUCTID', ''), // Stripe product ID for memberships
    country: env.e('BEABEE_STRIPE_COUNTRY', ['gb', 'eu', 'ca'] as const, 'gb'), // Stripe account country (default: gb)
  },

  // Localization settings
  countryCode: env.e('BEABEE_COUNTRYCODE', ['en', 'de', 'be'] as const), // Country code for localization
  currencyCode: env.s('BEABEE_CURRENCYCODE'), // Currency code (e.g., GBP, EUR)
  currencySymbol: env.s('BEABEE_CURRENCYSYMBOL'), // Currency symbol (e.g., £, €)

  // Password security settings
  passwordTries: env.n('BEABEE_PASSWORDTRIES', 3), // Max password attempt tries before lockout (default: 3)
  passwordIterations: env.n('BEABEE_PASSWORDITERATIONS', 50000), // PBKDF2 iterations for password hashing (default: 50000)

  // Grace period for expired memberships
  gracePeriod: {
    days: 7, // Number of days in grace period after expiry
  },

  // Logging configuration
  logging: env.b('BEABEE_LOGGING', false), // Enable logging (default: false)
  logFormat: env.e('BEABEE_LOGFORMAT', ['json', 'simple'] as const, 'json'), // Log format (default: json)

  // App configuration overrides from environment
  appOverrides: env.json('BEABEE_APPOVERRIDES', {}) as AppConfigOverrides, // JSON of app configuration overrides

  // Image service configuration
  image,

  // Document service configuration
  document,
};

export default config;
