import { ContributionInfo } from "@beabee/beabee-common";
import {
  CancelContributionResult,
  PaymentProvider,
  UpdateContributionResult,
  UpdatePaymentMethodResult
} from "#type/index";

class NoneProvider implements PaymentProvider {
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
  async onUpdateContact(): Promise<void> {}

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

export default new NoneProvider();
