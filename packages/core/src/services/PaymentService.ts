import {
  ContributionPeriod,
  MembershipStatus,
  PaymentFlowParams,
  PaymentMethod,
} from '@beabee/beabee-common';

import { getRepository, runTransaction } from '#database';
import { CantUpdateContributionError } from '#errors/index';
import { log as mainLogger } from '#logging';
import { Contact, ContactContribution, Payment } from '#models/index';
import {
  GCProvider,
  ManualProvider,
  PaymentProvider,
  StripeProvider,
} from '#providers/payment/index';
import {
  CompletedPaymentFlow,
  ContributionInfo,
  PaymentFlowForm,
  PaymentFlowFormCreateOneTimePayment,
  UpdateContributionForm,
  UpdateContributionResult,
} from '#type/index';
import { calcRenewalDate, getActualAmount } from '#utils/payment';

const log = mainLogger.child({ app: 'payment-service' });

const PaymentProviders = {
  [PaymentMethod.StripeCard]: StripeProvider,
  [PaymentMethod.StripeSEPA]: StripeProvider,
  [PaymentMethod.StripeBACS]: StripeProvider,
  [PaymentMethod.StripePayPal]: StripeProvider,
  [PaymentMethod.StripeIdeal]: StripeProvider,
  [PaymentMethod.GoCardlessDirectDebit]: GCProvider,
};

export function getMembershipStatus(contact: Contact): MembershipStatus {
  return contact.membership
    ? contact.membership.isActive
      ? contact.contribution.cancelledAt
        ? MembershipStatus.Expiring
        : MembershipStatus.Active
      : MembershipStatus.Expired
    : MembershipStatus.None;
}

type ProviderFn<T> = (
  p: PaymentProvider,
  data: ContactContribution
) => Promise<T>;

class PaymentService {
  async getContribution(contact: Contact): Promise<ContactContribution> {
    const contribution = await getRepository(
      ContactContribution
    ).findOneByOrFail({
      contactId: contact.id,
    });
    // No need to refetch contact, just add it in
    return { ...contribution, contact };
  }

  async getContributionBy(
    key: 'customerId' | 'mandateId' | 'subscriptionId',
    value: string
  ): Promise<ContactContribution | null> {
    return await getRepository(ContactContribution).findOne({
      where: { [key]: value },
      relations: { contact: true },
    });
  }

  async updateData(contact: Contact, updates: Partial<ContactContribution>) {
    await getRepository(ContactContribution).update(contact.id, updates);
  }

  private async provider(contact: Contact, fn: ProviderFn<void>): Promise<void>;
  private async provider<T>(contact: Contact, fn: ProviderFn<T>): Promise<T>;
  private async provider<T>(contact: Contact, fn: ProviderFn<T>): Promise<T> {
    return this.providerFromData(await this.getContribution(contact), fn);
  }

  private async providerFromData<T>(
    data: ContactContribution,
    fn: ProviderFn<T>
  ): Promise<T> {
    const Provider = data.method
      ? PaymentProviders[data.method]
      : ManualProvider;
    return await fn(new Provider(data), data);
  }

  async canProcessPaymentFlow(
    contact: Contact,
    form: PaymentFlowForm
  ): Promise<boolean> {
    const ret = await this.provider(contact, (p) =>
      p.canProcessPaymentFlow(form)
    );
    log.info(
      `Contact ${contact.id} ${ret ? 'can' : 'cannot'} process payment flow`,
      { form }
    );
    return ret;
  }

  async processPaymentFlow(
    contact: Contact,
    flow: CompletedPaymentFlow
  ): Promise<UpdateContributionResult | undefined> {
    log.info('Process payment flow for contact ' + contact.id, {
      flow,
    });

    const contribution = await this.getContribution(contact);

    const newMethod = flow.params.paymentMethod;

    // If the saved payment method is changing then cancel the old one, except
    // in the case of one-time payments as the payment method won't be saved
    if (
      flow.form.action !== 'create-one-time-payment' &&
      contribution.method !== newMethod
    ) {
      log.info('Changing payment method, cancelling previous contribution', {
        oldMethod: contribution.method,
        newMethod,
      });
      await this.providerFromData(contribution, (p) =>
        p.cancelContribution(false)
      );

      // Clear the old payment data, set the new method
      Object.assign(contribution, {
        ...ContactContribution.empty,
        method: newMethod,
      });
      await getRepository(ContactContribution).save(contribution);
    }

    const ret = await new PaymentProviders[newMethod](
      contribution
    ).processPaymentFlow(flow as any); // TODO: improve type

    if (flow.form.action === 'start-contribution') {
      await this.handlePostContributionUpdate(contact);
    }

    return ret;
  }

  async canUpdateContribution(
    contact: Contact,
    form: UpdateContributionForm
  ): Promise<boolean> {
    const ret = await this.provider(contact, (p) =>
      p.canUpdateContribution(form)
    );
    log.info(
      `Contact ${contact.id} ${ret ? 'can' : 'cannot'} update contribution`
    );
    return ret;
  }

  async processUpdateContribution(
    contact: Contact,
    form: UpdateContributionForm
  ): Promise<UpdateContributionResult> {
    log.info('Update contribution for contact ' + contact.id);

    // Active members can't change from annual to monthly contributions at the
    // moment as the behaviour of the necessary proration is unclear (i.e. do
    // they get a refund for time not used, does it only change in the next
    // contribution period)
    if (
      contact.membership?.isActive &&
      contact.contributionPeriod === ContributionPeriod.Annually &&
      form.period !== ContributionPeriod.Annually
    ) {
      throw new CantUpdateContributionError();
    }

    const ret = await this.provider(contact, (p) =>
      p.processUpdateContribution(form)
    );

    await this.handlePostContributionUpdate(contact);

    return ret;
  }

  async getContributionInfo(contact: Contact): Promise<ContributionInfo> {
    return await this.provider<ContributionInfo>(contact, async (p, d) => {
      // Store payment data in contact for getMembershipStatus
      // TODO: fix this!
      contact.contribution = d;

      const renewalDate = !d.cancelledAt && calcRenewalDate(contact);

      return {
        type: contact.contributionType,
        ...(contact.contributionAmount !== null && {
          amount: contact.contributionAmount,
        }),
        ...(contact.contributionPeriod !== null && {
          period: contact.contributionPeriod,
        }),
        ...(d.payFee !== null && { payFee: d.payFee }),
        ...(d.nextAmount &&
          contact.contributionPeriod && {
            nextAmount: getActualAmount(
              d.nextAmount.monthly,
              contact.contributionPeriod
            ),
          }),
        ...(contact.membership?.dateExpires && {
          membershipExpiryDate: contact.membership.dateExpires,
        }),
        membershipStatus: getMembershipStatus(contact),
        ...(await p.getContributionInfo()),
        ...(d.cancelledAt && { cancellationDate: d.cancelledAt }),
        ...(renewalDate && { renewalDate }),
      };
    });
  }

  async cancelContribution(
    contact: Contact,
    keepMandate = false
  ): Promise<void> {
    log.info('Cancel contribution for contact ' + contact.id);
    await this.provider(contact, (p) => p.cancelContribution(keepMandate));
    await getRepository(ContactContribution).update(
      { contactId: contact.id },
      { cancelledAt: new Date() }
    );
  }

  async getPayments(contact: Contact): Promise<Payment[]> {
    return await getRepository(Payment).findBy({ contactId: contact.id });
  }

  async createContact(contact: Contact): Promise<void> {
    log.info('Create contribution for contact ' + contact.id);
    await getRepository(ContactContribution).save({ contact });
  }

  async updateContact(
    contact: Contact,
    updates: Partial<Contact>
  ): Promise<void> {
    log.info('Update contact for contact ' + contact.id);
    await this.provider(contact, (p) => p.updateContact(updates));
  }

  async fetchInvoiceUrl(paymentId: string): Promise<string | null> {
    log.info('Fetch invoice URL for payment ' + paymentId);

    if (paymentId.startsWith('in_')) {
      return await StripeProvider.fetchInvoiceUrl(paymentId);
    } else {
      // Currently only Stripe invoices are supported
      return null;
    }
  }

  /**
   * Permanently delete or disassociate all payment related data for a contact.
   * This will also cancel any active contributions
   *
   * @param contact The contact
   */
  async permanentlyDeleteContact(contact: Contact): Promise<void> {
    log.info('Permanently delete payment data for contact ' + contact.id);
    await this.provider(contact, (p) => p.permanentlyDeleteContact());

    await runTransaction(async (em) => {
      await em
        .getRepository(ContactContribution)
        .delete({ contactId: contact.id });
      await em
        .getRepository(Payment)
        .update({ contactId: contact.id }, { contactId: null });
    });
  }

  /**
   * Handle a contribution being started, restarted or just updated.  This
   * resets any cancellation status as the contribution is now assumed to be
   * active again
   *
   * @param contact The contact
   */
  private async handlePostContributionUpdate(contact: Contact) {
    await getRepository(ContactContribution).update(
      { contactId: contact.id },
      { cancelledAt: null }
    );
  }
}

export const paymentService = new PaymentService();
export default paymentService;
