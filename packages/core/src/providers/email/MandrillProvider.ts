import axios, { AxiosRequestTransformer } from 'axios';

import { MandrillEmailConfig } from '#config/config';
import { log as mainLogger } from '#logging';
import type { EmailOptions, EmailRecipient, PreparedEmail } from '#type/index';

import { BaseProvider } from './BaseProvider';

const log = mainLogger.child({ app: 'mandrill-email-provider' });

interface MandrillMessage {
  to: { email: string; name?: string }[];
  merge_vars: {
    rcpt: string;
    vars: { name: string; content: string }[];
  }[];
  attachments?: { type: string; name: string; content: string }[];
}

export class MandrillProvider extends BaseProvider {
  private readonly instance;

  constructor(settings: MandrillEmailConfig['settings']) {
    super();
    this.instance = axios.create({
      baseURL: 'https://mandrillapp.com/api/1.0/',
      // Add key to all POST request bodys
      transformRequest: [
        (data, headers) => {
          return { ...data, key: settings.apiKey };
        },
        ...(axios.defaults.transformRequest as AxiosRequestTransformer[]),
      ],
      timeout: 1000,
      headers: { 'X-Custom-Header': 'foobar' },
    });
  }

  protected async doSendEmail(
    email: PreparedEmail,
    recipients: EmailRecipient[],
    opts?: EmailOptions
  ): Promise<void> {
    const resp = await this.instance.post('/messages/send', {
      message: {
        ...this.createMessageData(recipients, opts),
        from_name: email.fromName,
        from_email: email.fromEmail,
        subject: email.subject,
        html: email.body,
        auto_text: true,
      },
      ...(opts?.sendAt && { send_at: opts.sendAt.toISOString() }),
    });

    log.info('Sent email', { data: resp.data });
  }

  private createMessageData(
    recipients: EmailRecipient[],
    opts?: EmailOptions
  ): MandrillMessage {
    return {
      to: recipients.map((r) => r.to),
      merge_vars: recipients.map((r) => ({
        rcpt: r.to.email,
        vars: Object.entries(r.mergeFields || []).map(([name, content]) => ({
          name,
          content,
        })),
      })),
      ...(opts?.attachments && { attachments: opts.attachments }),
    };
  }
}

/** @deprecated Use named import MandrillProvider instead */
export default MandrillProvider;
