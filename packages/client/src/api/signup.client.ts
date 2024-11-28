import {
  type CompleteSignupData,
  ContributionPeriod,
  type PaymentFlowParams,
  type Serial,
  type SignupData,
} from "@beabee/beabee-common";
import type { BaseClientOptions } from "../types/index.ts";
import { BaseClient } from "./base.client.ts";
import { cleanUrl } from "../utils/index.ts";

/**
 * Client for managing user signup and registration
 */
export class SignupClient extends BaseClient {
  /**
   * The URL to complete the signup process
   */
  readonly completeUrl: string;

  /**
   * Creates a new signup client
   * @param options - The client options
   */
  constructor(protected override readonly options: BaseClientOptions) {
    options.path = cleanUrl(options.path + "/signup");
    super(options);
    this.completeUrl = this.options.host + "/join/complete";
  }

  /**
   * Initiates the signup process for a new user
   * @param data - The signup data including email and contribution details
   * @returns Payment flow parameters for completing signup
   */
  async start(data: SignupData): Promise<PaymentFlowParams> {
    const { data: responseData } = await this.fetch.post<
      Serial<PaymentFlowParams>
    >(
      "",
      {
        email: data.email,
        loginUrl: this.options.host + "/auth/login",
        setPasswordUrl: this.options.host + "/auth/set-password",
        confirmUrl: this.options.host + "/join/confirm-email",
        ...(!data.noContribution && {
          contribution: {
            amount: data.amount,
            period: data.period,
            payFee: data.payFee && data.period === ContributionPeriod.Monthly,
            prorate: false,
            paymentMethod: data.paymentMethod,
            completeUrl: this.completeUrl,
          },
        }),
      },
    );
    return responseData;
  }

  /**
   * Completes the signup process with user details
   * @param data - The completion data including name and payment details
   */
  async complete(data: CompleteSignupData): Promise<void> {
    await this.fetch.post("/complete", {
      paymentFlowId: data.paymentFlowId,
      firstname: data.firstname,
      lastname: data.lastname,
      vatNumber: data.vatNumber,
    });
  }

  /**
   * Confirms a user's email address
   * @param joinFlowId - The join flow ID from the confirmation email
   */
  async confirmEmail(joinFlowId: string | string[]): Promise<void> {
    await this.fetch.post("/confirm-email", { joinFlowId });
  }
}
