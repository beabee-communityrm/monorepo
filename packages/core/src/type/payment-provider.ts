import { Contact, ContactContribution } from "#models/index";
import { PaymentForm } from "@beabee/beabee-common";
import {
  CancelContributionResult,
  CompletedPaymentFlow,
  ContributionInfo,
  UpdateContributionResult,
  UpdatePaymentMethodResult
} from ".";

export interface PaymentProvider {
  canChangeContribution(
    contribution: ContactContribution,
    useExistingMandate: boolean,
    paymentForm: PaymentForm
  ): Promise<boolean>;

  cancelContribution(
    contribution: ContactContribution,
    keepMandate: boolean
  ): Promise<CancelContributionResult>;

  getContributionInfo(
    contribution: ContactContribution
  ): Promise<Partial<ContributionInfo>>;

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
