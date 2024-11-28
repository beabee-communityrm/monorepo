import { BaseClient } from "./base.client.ts";
import { CalloutClient } from "./callout.client.ts";
import { ContentClient } from "./content.client.ts";
import { ContactClient } from "./contact.client.ts";
import { ApiKeyClient } from "./api-key.client.ts";
import { AuthClient } from "./auth.client.ts";
import { EmailClient } from "./email.client.ts";
import { NoticeClient } from "./notice.client.ts";
import { PaymentClient } from "./payment.client.ts";
import { ResetSecurityClient } from "./reset-security.client.ts";
import { SegmentsClient } from "./segments.client.ts";
import { SignupClient } from "./signup.client.ts";
import { StatsClient } from "./stats.client.ts";
import type { BaseClientOptions } from "../types/index.ts";

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
    this.notice = new NoticeClient(options);
    this.payment = new PaymentClient(options);
    this.resetSecurity = new ResetSecurityClient(options);
    this.segments = new SegmentsClient(options);
    this.signup = new SignupClient(options);
    this.stats = new StatsClient(options);
  }
}
