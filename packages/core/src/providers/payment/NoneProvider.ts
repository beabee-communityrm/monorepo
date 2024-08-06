import { CancelContributionResult } from "#type/cancel-contribution-results";
import { ContributionInfo } from "#type/contribution-info";
import { UpdateContributionResult } from "#type/update-contribution-result";
import { UpdatePaymentMethodResult } from "#type/update-payment-method-result";
import { PaymentProvider } from ".";

export default class NoneProvider extends PaymentProvider {
  canChangeContribution(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  async getContributionInfo(): Promise<Partial<ContributionInfo>> {
    return {};
  }

  async cancelContribution(): Promise<CancelContributionResult> {
    return {
      mandateId: null,
      subscriptionId: null
    };
  }
  async updateContact(): Promise<void> {}

  updateContribution(): Promise<UpdateContributionResult> {
    throw new Error("Method not implemented.");
  }
  async updatePaymentMethod(): Promise<UpdatePaymentMethodResult> {
    return {
      customerId: "",
      mandateId: ""
    };
  }

  async permanentlyDeleteContact(): Promise<void> {}
}
