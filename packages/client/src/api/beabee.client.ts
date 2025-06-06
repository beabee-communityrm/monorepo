import { BaseClient } from './base.client.js';
import { CalloutClient } from './callout.client.js';
import { ContentClient } from './content.client.js';
import { ContactClient } from './contact.client.js';
import { ApiKeyClient } from './api-key.client.js';
import { AuthClient } from './auth.client.js';
import { EmailClient } from './email.client.js';
import { HealthClient } from './health.client.js';
import { NoticeClient } from './notice.client.js';
import { PaymentClient } from './payment.client.js';
import { ResetSecurityClient } from './reset-security.client.js';
import { SegmentsClient } from './segments.client.js';
import { SignupClient } from './signup.client.js';
import { StatsClient } from './stats.client.js';
import { UploadClient } from './upload.client.js';
import type { BaseClientOptions } from '../types/index.js';

/**
 * Main client for interacting with the Beabee API
 * Provides access to all API functionalities through specialized sub-clients
 * @extends BaseClient
 * @example
 * ```typescript
 * const client = new BeabeeClient({
 *   host: 'https://api.example.com',
 *   token: 'your-auth-token'
 * });
 *
 * // Use sub-clients
 * await client.content.get('join/setup');
 * await client.callout.list();
 * ```
 */
export class BeabeeClient extends BaseClient {
  /** Client for managing content pages and blocks */
  readonly content: ContentClient;

  /** Client for managing callouts and their responses */
  readonly callout: CalloutClient;

  /** Client for managing contacts (users) */
  readonly contact: ContactClient;

  /** Client for managing API keys */
  readonly apiKey: ApiKeyClient;

  /** Client for managing authentication */
  readonly auth: AuthClient;

  /** Client for managing emails */
  readonly email: EmailClient;

  /** Client for checking API health status */
  readonly health: HealthClient;

  /** Client for managing system notices */
  readonly notice: NoticeClient;

  /** Client for managing payments */
  readonly payment: PaymentClient;

  /** Client for managing security reset flows */
  readonly resetSecurity: ResetSecurityClient;

  /** Client for managing segments */
  readonly segments: SegmentsClient;

  /** Client for managing signup */
  readonly signup: SignupClient;

  /** Client for fetching statistics */
  readonly stats: StatsClient;

  /** Client for managing file uploads */
  readonly upload: UploadClient;

  /**
   * Creates a new Beabee API client instance
   * @param options - Configuration options for the client
   * @param options.host - API host URL
   * @param options.token - Authentication token
   * @param options.path - Optional base path for API endpoints (defaults to /api/1.0)
   */
  constructor(protected override readonly options: BaseClientOptions) {
    super(options);
    this.content = new ContentClient(options);
    this.callout = new CalloutClient(options);
    this.contact = new ContactClient(options);
    this.apiKey = new ApiKeyClient(options);
    this.auth = new AuthClient(options);
    this.email = new EmailClient(options);
    this.health = new HealthClient(options);
    this.notice = new NoticeClient(options);
    this.payment = new PaymentClient(options);
    this.resetSecurity = new ResetSecurityClient(options);
    this.segments = new SegmentsClient(options);
    this.signup = new SignupClient(options);
    this.stats = new StatsClient(options);
    this.upload = new UploadClient(options);
  }
}
