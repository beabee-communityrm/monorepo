import { Contact, ContactContribution } from "#models/index";
import { PaymentForm } from "@beabee/beabee-common";
import {
  CancelContributionResult,
  CompletedPaymentFlow,
  GetContributionInfoResult,
  UpdateContributionResult,
  UpdatePaymentMethodResult
} from ".";

export interface PaymentProvider {
  canChangeContribution(
    contribution: ContactContribution,
    useExistingMandate: boolean,
    paymentForm: PaymentForm
  ): Promise<boolean>;

  getContributionInfo(
    contribution: ContactContribution
  ): Promise<GetContributionInfoResult>;

  cancelContribution(
    contribution: ContactContribution,
    keepMandate: boolean
  ): Promise<CancelContributionResult>;

  updateContact(
    contribution: ContactContribution,
    updates: Partial<Contact>
  ): Promise<void>;

  updateContribution(
    contribution: ContactContribution,
    paymentForm: PaymentForm
  ): Promise<UpdateContributionResult>;

  updatePaymentMethod(
    contribution: ContactContribution,
    completedPaymentFlow: CompletedPaymentFlow
  ): Promise<UpdatePaymentMethodResult>;

  permanentlyDeleteContact(contribution: ContactContribution): Promise<void>;
}
