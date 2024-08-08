import { PaymentForm, PaymentMethod } from "@beabee/beabee-common";

import { getRepository } from "#database";

import { Contact, ContactContribution } from "#models/index";

import {
  CancelContributionResult,
  CompletedPaymentFlow,
  ContributionInfo,
  UpdateContributionResult,
  UpdatePaymentMethodResult
} from "#type/index";

export abstract class PaymentProvider {
  protected readonly data: ContactContribution;
  protected readonly contact: Contact;

  constructor(data: ContactContribution) {
    this.data = data;
    this.contact = data.contact;
  }

  protected async updateData() {
    await getRepository(ContactContribution).update(this.contact.id, this.data);
  }

  abstract canChangeContribution(
    useExistingMandate: boolean,
    paymentForm: PaymentForm
  ): Promise<boolean>;

  abstract cancelContribution(
    keepMandate: boolean
  ): Promise<CancelContributionResult>;

  abstract getContributionInfo(): Promise<Partial<ContributionInfo>>;

  abstract updateContact(updates: Partial<Contact>): Promise<void>;

  abstract updateContribution(
    paymentForm: PaymentForm
  ): Promise<UpdateContributionResult>;

  abstract updatePaymentMethod(
    completedPaymentFlow: CompletedPaymentFlow
  ): Promise<UpdatePaymentMethodResult>;

  abstract permanentlyDeleteContact(): Promise<void>;
}
