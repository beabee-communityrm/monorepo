import { ApiHealthStatus } from '@beabee/beabee-common';

import sgMail from '@sendgrid/mail';
import axios, { type AxiosInstance } from 'axios';

import { SendGridEmailConfig } from '#config/config';
import { log as mainLogger } from '#logging';
import OptionsService from '#services/OptionsService';
import type { EmailOptions, EmailRecipient, PreparedEmail } from '#type/index';
import { getEmailDomain } from '#utils/email';

import { BaseProvider } from './BaseProvider.js';

const log = mainLogger.child({ app: 'sendgrid-email-provider' });

interface SendGridAuthenticatedDomain {
  domain: string;
  valid: boolean;
}

export class SendGridProvider extends BaseProvider {
  private readonly testMode: boolean;
  private readonly instance: AxiosInstance;

  constructor(settings: SendGridEmailConfig['settings']) {
    super();
    sgMail.setApiKey(settings.apiKey);
    sgMail.setSubstitutionWrappers('*|', '|*');
    this.testMode = settings.testMode;
    // Plain axios instance for the few REST calls we make (e.g. health
    // checks); simpler than pulling in the SendGrid client
    this.instance = axios.create({
      baseURL: 'https://api.sendgrid.com/v3/',
      headers: { Authorization: `Bearer ${settings.apiKey}` },
    });
  }

  protected async doSendEmail(
    email: PreparedEmail,
    recipients: EmailRecipient[],
    opts?: EmailOptions
  ): Promise<void> {
    for (let i = 0; i < recipients.length; i += 1000) {
      const resp = await sgMail.sendMultiple({
        from: {
          email: email.fromEmail,
          name: email.fromName,
        },
        subject: email.subject,
        html: email.body,
        personalizations: recipients.slice(i, i + 1000).map((recipient) => ({
          to: recipient.to,
          ...(recipient.mergeFields && {
            substitutions: recipient.mergeFields,
          }),
        })),
        ...(opts?.sendAt && {
          sendAt: +opts.sendAt,
        }),
        ...(opts?.attachments && {
          attachments: opts.attachments.map((attachment) => ({
            filename: attachment.name,
            type: attachment.type,
            content: attachment.content,
          })),
        }),
        mailSettings: {
          sandboxMode: {
            enable: this.testMode,
          },
        },
      });

      log.info(
        `Sent email to recipients ${i} to ${i + 1000} of ${recipients.length}`,
        { resp }
      );
    }
  }

  async getHealthStatus(): Promise<ApiHealthStatus> {
    const domain = getEmailDomain(OptionsService.getText('support-email'));
    if (!domain) {
      log.warning('SendGrid health check failed: no support email configured');
      return ApiHealthStatus.UNHEALTHY;
    }

    try {
      // Check we can send as the support email domain by confirming it is
      // authenticated and valid in SendGrid
      const { data } = await this.instance.get<SendGridAuthenticatedDomain[]>(
        '/whitelabel/domains',
        { params: { domain } }
      );
      const authenticated = data.some((d) => d.valid && d.domain === domain);
      if (!authenticated) {
        log.warning(
          `SendGrid health check failed: domain ${domain} is not authenticated`
        );
        return ApiHealthStatus.UNHEALTHY;
      }
      return ApiHealthStatus.HEALTHY;
    } catch (err) {
      log.error('SendGrid health check failed', err);
      return ApiHealthStatus.UNHEALTHY;
    }
  }
}
