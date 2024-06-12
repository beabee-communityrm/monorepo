import { Contact } from "@beabee/models";
import { PaymentProvider } from "./index.js";

import type { CompletedPaymentFlow, ContributionInfo } from "#types/index";

import type {
  PaymentForm,
  UpdateContributionResult
} from "@beabee/beabee-common";

export default class ManualProvider extends PaymentProvider {
  async canChangeContribution(useExistingMandate: boolean): Promise<boolean> {
    return !useExistingMandate;
  }
  async getContributionInfo(): Promise<Partial<ContributionInfo>> {
    return {
      paymentSource: {
        method: null,
        ...(this.data.customerId && {
          reference: this.data.customerId
        }),
        ...(this.data.mandateId && {
          source: this.data.mandateId
        })
      }
    };
  }

  async cancelContribution(keepMandate: boolean): Promise<void> {}
  async updateContact(updates: Partial<Contact>): Promise<void> {}

  async updateContribution(
    paymentForm: PaymentForm
  ): Promise<UpdateContributionResult> {
    throw new Error("Method not implemented.");
  }
  async updatePaymentMethod(
    completedPaymentFlow: CompletedPaymentFlow
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async permanentlyDeleteContact(): Promise<void> {}
}
