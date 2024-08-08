import {
  ContributionInfo,
  PaymentForm,
  PaymentMethod
} from "@beabee/beabee-common";

import { ContactContribution } from "#models/index";

import {
  CancelContributionResult,
  CompletedPaymentFlow,
  PaymentProvider,
  UpdateContributionResult,
  UpdatePaymentMethodResult
} from "#type/index";

class ManualProvider implements PaymentProvider {
  async canChangeContribution(
    contribution: ContactContribution,
    useExistingMandate: boolean
  ): Promise<boolean> {
    return !useExistingMandate;
  }

  async getContributionInfo(
    contribution: ContactContribution
  ): Promise<Partial<ContributionInfo>> {
    return {
      paymentSource: {
        method: PaymentMethod.Manual,
        ...(contribution.customerId && {
          reference: contribution.customerId
        }),
        ...(contribution.mandateId && {
          source: contribution.mandateId
        })
      }
    };
  }

  async cancelContribution(): Promise<CancelContributionResult> {
    return {
      mandateId: null,
      subscriptionId: null
    };
  }
  async updateContact(): Promise<void> {}

  async updatePaymentMethod(
    contribution: ContactContribution,
    flow: CompletedPaymentFlow
  ): Promise<UpdatePaymentMethodResult> {
    return {
      customerId: flow.customerId,
      mandateId: flow.mandateId
    };
  }

  async updateContribution(
    contribution: ContactContribution,
    paymentForm: PaymentForm
  ): Promise<UpdateContributionResult> {
    return {
      startNow: true,
      subscriptionId: ""
    };
  }

  async permanentlyDeleteContact(): Promise<void> {}
}

export default new ManualProvider();
