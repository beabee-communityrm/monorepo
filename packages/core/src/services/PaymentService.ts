import {
  ContributionInfo,
  ContributionPeriod,
  MembershipStatus,
  PaymentForm,
  PaymentMethod
} from "@beabee/beabee-common";

import { getRepository, runTransaction } from "#database";
import { log as mainLogger } from "#logging";
import { calcRenewalDate } from "#utils/payment";

import { Contact, Payment, ContactContribution } from "#models/index";

import GCProvider from "#providers/payment/GCProvider";
import ManualProvider from "#providers/payment/ManualProvider";
import NoneProvider from "#providers/payment/NoneProvider";
import StripeProvider from "#providers/payment/StripeProvider";

import {
  CompletedPaymentFlow,
  PaymentProvider,
  UpdateContributionResult
} from "#type/index";
import { CantUpdateContribution } from "#errors/CantUpdateContribution";

const log = mainLogger.child({ app: "payment-service" });

const paymentProviders = {
  [PaymentMethod.None]: NoneProvider,
  [PaymentMethod.Manual]: ManualProvider,
  [PaymentMethod.StripeCard]: StripeProvider,
  [PaymentMethod.StripeSEPA]: StripeProvider,
  [PaymentMethod.StripeBACS]: StripeProvider,
  [PaymentMethod.StripePayPal]: StripeProvider,
  [PaymentMethod.GoCardlessDirectDebit]: GCProvider
} satisfies Record<PaymentMethod, PaymentProvider>;

type ProviderFn<T> = (
  provider: PaymentProvider,
  contribution: ContactContribution
) => Promise<T>;

class PaymentService {
  async getContribution(contact: Contact): Promise<ContactContribution> {
    const contribution = await getRepository(
      ContactContribution
    ).findOneByOrFail({
      contactId: contact.id,
      status: "current"
    });
    // No need to do a join on contact
    contribution.contact = contact;
    return contribution;
  }

  async getContributionBy(
    key: "customerId" | "mandateId" | "subscriptionId",
    value: string
  ): Promise<ContactContribution | null> {
    return await getRepository(ContactContribution).findOne({
      where: { [key]: value },
      relations: { contact: true },
      order: { createdAt: "DESC" }
    });
  }

  private async withProvider<T>(
    contact: Contact,
    fn: ProviderFn<T>
  ): Promise<T> {
    const contribution = await this.getContribution(contact);
    return await fn(paymentProviders[contribution.method], contribution);
  }

  async canChangeContribution(
    contact: Contact,
    useExistingPaymentSource: boolean,
    paymentForm: PaymentForm
  ): Promise<boolean> {
    return await this.withProvider(contact, async (provider, contribution) => {
      const canChange = await provider.canChangeContribution(
        contribution,
        useExistingPaymentSource,
        paymentForm
      );
      log.info(
        `Contact ${contact.id} ${canChange ? "can" : "cannot"} change contribution`
      );
      return canChange;
    });
  }

  async getContributionInfo(contact: Contact): Promise<ContributionInfo> {
    return await this.withProvider<ContributionInfo>(
      contact,
      async (provider, contribution) => {
        // Store payment data in contact for getMembershipStatus
        // TODO: fix this!
        contact.contributions = [contribution];

        const renewalDate =
          !contribution.cancelledAt && calcRenewalDate(contact);

        return {
          type: contact.contributionType,
          ...(contribution.amount !== null && {
            amount: contribution.amount
          }),
          ...(contribution.period !== null && {
            period: contribution.period
          }),
          ...(contribution.payFee !== null && { payFee: contribution.payFee }),
          // TODO: pending amount
          // ...
          ...(contact.membership?.dateExpires && {
            membershipExpiryDate: contact.membership.dateExpires
          }),
          membershipStatus: contact.membershipStatus,
          ...(await provider.getContributionInfo(contribution)),
          ...(contribution.cancelledAt && {
            cancellationDate: contribution.cancelledAt
          }),
          ...(renewalDate && { renewalDate })
        };
      }
    );
  }

  async getPayments(contact: Contact): Promise<Payment[]> {
    return await getRepository(Payment).findBy({ contactId: contact.id });
  }

  async onCreateContact(contact: Contact): Promise<void> {
    log.info("Create contact for contact " + contact.id);
    const contribution = await getRepository(ContactContribution).save({
      contactId: contact.id,
      status: "current",
      method: PaymentMethod.None
    });

    contact.contributions = [contribution];
  }

  async onUpdateContact(
    contact: Contact,
    updates: Partial<Contact>
  ): Promise<void> {
    log.info("Update contact for contact " + contact.id);
    await this.withProvider(contact, (p, c) => p.updateContact(c, updates));
  }

  async updateContribution(
    contact: Contact,
    paymentForm: PaymentForm
  ): Promise<UpdateContributionResult> {
    log.info("Update contribution for contact " + contact.id, { paymentForm });

    // Some period changes on active members aren't allowed at the moment to
    // prevent proration problems
    if (
      contact.membership?.isActive &&
      // Annual contributors can't change their period
      contact.contributionPeriod === ContributionPeriod.Annually &&
      paymentForm.period !== ContributionPeriod.Annually
    ) {
      log.info("Can't update contribution for " + contact.id);
      throw new CantUpdateContribution();
    }

    return await this.withProvider(contact, async (provider, contribution) => {
      if (contribution.subscriptionId && !contact.membership?.isActive) {
        log.info("Contact has a subscription but is not active, cancelling");
        await this.cancelContribution(contact);
        contribution = await this.getContribution(contact);
      }

      const result = await provider.updateContribution(
        contribution,
        paymentForm
      );

      await this.setNewContribution(contribution, {
        status: result.startNow ? "current" : "pending",
        subscriptionId: result.subscriptionId,
        monthlyAmount: paymentForm.monthlyAmount,
        period: paymentForm.period,
        payFee: paymentForm.payFee
      });

      return result;
    });
  }

  async updatePaymentMethod(
    contact: Contact,
    flow: CompletedPaymentFlow
  ): Promise<void> {
    log.info("Update payment method for contact " + contact.id, { flow });

    let contribution = await this.getContribution(contact);
    const newMethod = flow.paymentMethod;

    if (
      contribution.method !== newMethod &&
      contribution.method !== PaymentMethod.None
    ) {
      log.info("Changing payment method, cancelling previous contribution", {
        contribution,
        newMethod
      });

      await this.cancelContribution(contact, false);
      contribution = await this.getContribution(contact);
    }

    const result = await paymentProviders[newMethod].updatePaymentMethod(
      contribution,
      flow
    );

    await this.setNewContribution(contribution, {
      method: newMethod,
      customerId: result.customerId,
      mandateId: result.mandateId,
      cancelledAt: null
    });
  }

  async cancelContribution(
    contact: Contact,
    keepMandate = false
  ): Promise<void> {
    return await this.withProvider(contact, async (provider, contribution) => {
      log.info("Cancel contribution for contact " + contact.id);

      const result = await provider.cancelContribution(
        contribution,
        keepMandate
      );

      await this.setNewContribution(contribution, {
        cancelledAt: new Date(),
        ...result
      });
    });
  }

  /**
   * Permanently delete or disassociate all payment related data for a contact.
   * This will also cancel any active contributions
   *
   * @param contact The contact
   */
  async permanentlyDeleteContact(contact: Contact): Promise<void> {
    log.info("Permanently delete payment data for contact " + contact.id);
    await this.withProvider(contact, (p, c) => p.permanentlyDeleteContact(c));

    await runTransaction(async (em) => {
      await em
        .getRepository(ContactContribution)
        .delete({ contactId: contact.id });
      await em
        .getRepository(Payment)
        .update({ contactId: contact.id }, { contactId: null });
    });
  }

  private async setNewContribution(
    contribution: ContactContribution,
    updates: Partial<ContactContribution>
  ) {
    await runTransaction(async (em) => {
      // Archive the current contribution if it's being overridden
      if (updates.status === undefined || updates.status === "current") {
        await em.getRepository(ContactContribution).update(contribution.id, {
          status: null
        });
      }

      // Remove ID so save is based on unique keys (contact, status)
      const { id, createdAt, updatedAt, ...contributionNoId } = contribution;
      await em.getRepository(ContactContribution).save({
        ...contributionNoId,
        ...updates
      });
    });
  }
}

export default new PaymentService();
