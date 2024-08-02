import { PaymentForm } from "@beabee/beabee-common";

import { Contact } from "#models/index";
import { PaymentProvider } from ".";

import {
  CompletedPaymentFlow,
  ContributionInfo,
  UpdateContributionResult
} from "#type/index";
import { UpdatePaymentMethodResult } from "#type/update-payment-method-result";

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

  async updatePaymentMethod(
    flow: CompletedPaymentFlow
  ): Promise<UpdatePaymentMethodResult> {
    return {
      customerId: flow.customerId,
      mandateId: flow.mandateId
    };
  }

  async updateContribution(
    paymentForm: PaymentForm
  ): Promise<UpdateContributionResult> {
    return {
      startNow: true,
      expiryDate: null,
      subscriptionId: ""
    };
  }

  async permanentlyDeleteContact(): Promise<void> {}
}
