import { PaymentMethod } from "@beabee/beabee-common";

import { database } from "#core/database";

import { Contact, ContactContribution } from "@beabee/models";

import type {
  CompletedPaymentFlow,
  ContributionInfo
} from "../../types/index.js";

import type {
  PaymentForm,
  UpdateContributionResult
} from "@beabee/beabee-common";

export abstract class PaymentProvider {
  protected readonly data: ContactContribution;
  protected readonly contact: Contact;
  protected readonly method: PaymentMethod;

  constructor(data: ContactContribution) {
    this.data = data;
    this.contact = data.contact;
    this.method = data.method as PaymentMethod;
  }

  protected async updateData() {
    await database
      .getRepository(ContactContribution)
      .update(this.contact.id, this.data);
  }

  abstract canChangeContribution(
    useExistingMandate: boolean,
    paymentForm: PaymentForm
  ): Promise<boolean>;

  abstract cancelContribution(keepMandate: boolean): Promise<void>;

  abstract getContributionInfo(): Promise<Partial<ContributionInfo>>;

  abstract updateContact(updates: Partial<Contact>): Promise<void>;

  abstract updateContribution(
    paymentForm: PaymentForm
  ): Promise<UpdateContributionResult>;

  abstract updatePaymentMethod(
    completedPaymentFlow: CompletedPaymentFlow
  ): Promise<void>;

  abstract permanentlyDeleteContact(): Promise<void>;
}
