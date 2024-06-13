import {
  Payment as GCPayment,
  PaymentStatus as GCPaymentStatus,
  Subscription as GCSubscription,
  SubscriptionIntervalUnit
} from "gocardless-nodejs/types/Types";
import moment, { DurationInputObject } from "moment";

import {
  database,
  gocardless,
  log as mainLogger,
  gocardlessUtils,
  contactsService,
  paymentService
} from "@beabee/core";

import { Payment } from "@beabee/models";

import { config } from "@beabee/config";
import { PaymentStatus } from "@beabee/beabee-common";
import currentLocale from "#locale";

const log = mainLogger.child({ app: "payment-webhook-utils" });

export async function updatePayment(
  gcPaymentId: string,
  action?: string
): Promise<void> {
  log.info("Update payment " + gcPaymentId);

  const gcPayment = await gocardless.payments.get(gcPaymentId);
  const payment = await findOrCreatePayment(gcPayment);

  if (payment) {
    payment.status = gocardlessUtils.convertStatus(gcPayment.status!);
    payment.description = gcPayment.description || "Unknown";
    payment.amount = Number(gcPayment.amount) / 100;
    payment.amountRefunded = Number(gcPayment.amount_refunded) / 100;
    payment.chargeDate = moment.utc(gcPayment.charge_date).toDate();

    await database.getRepository(Payment).save(payment);

    switch (action) {
      case "cancelled":
      case "failed":
        await cancelPayment(payment);
        break;

      case "confirmed":
        await confirmPayment(payment);
        break;
    }
  }
}

async function cancelPayment(payment: Payment): Promise<void> {
  if (!payment.contact?.membership?.isActive || !payment.subscriptionId) {
    return;
  }

  const expiryDate = await calcFailedPaymentPeriodEnd(payment);

  log.info("Cancel payment " + payment.id, {
    paymentId: payment.id,
    contactId: payment.contact.id,
    subscriptionId: payment.subscriptionId,
    expiryDate
  });

  if (expiryDate) {
    await contactsService.updateContactRole(payment.contact, "member", {
      dateExpires: expiryDate
    });
  } else {
    await contactsService.revokeContactRole(payment.contact, "member");
  }
}

async function confirmPayment(payment: Payment): Promise<void> {
  log.info("Confirm payment " + payment.id, {
    paymentId: payment.id,
    contactId: payment.contact?.id,
    subscriptionId: payment.subscriptionId
  });

  if (!payment.contact || !payment.subscriptionId) {
    log.info(
      `Ignore confirm payment for ${payment.id}, not subscription related`
    );
    return;
  }

  // TODO: Keep list of valid subscriptions
  // if (payment.subscriptionId !== gcData.subscriptionId) {
  //   log.error("Mismatched subscription IDs for payment " + payment.id, {
  //     gcSubscriptionId: payment.subscriptionId,
  //     ourSubscriptionId: gcData.subscriptionId
  //   });
  //   return;
  // }

  await contactsService.extendContactRole(
    payment.contact,
    "member",
    await calcConfirmedPaymentPeriodEnd(payment)
  );

  const contribution = await paymentService.getContribution(payment.contact);
  if (payment.amount === contribution.nextAmount?.chargeable) {
    await contactsService.updateContact(payment.contact, {
      contributionMonthlyAmount: contribution.nextAmount?.monthly
    });
    await paymentService.updateData(payment.contact, { nextAmount: null });
  }
  // TODO: resubscribe to newsletter
}

/**
 * Calculate when subscription this payment is associated with will renew. This
 * assumes the payment was confirmed and either uses the subscription's next
 * payment date or the payment's date if the subscription has been cancelled
 *
 * @param payment The confirmed payment
 * @returns The current period end for the subscription
 */
async function calcConfirmedPaymentPeriodEnd(payment: Payment): Promise<Date> {
  const subscription = await gocardless.subscriptions.get(
    payment.subscriptionId!
  );

  if (
    subscription.upcoming_payments &&
    subscription.upcoming_payments.length > 0
  ) {
    return moment
      .utc(subscription.upcoming_payments[0].charge_date)
      .add(config.gracePeriod)
      .toDate();
  } else {
    // If the subscription has been cancelled there won't be any upcoming payments
    return moment
      .utc(payment.chargeDate)
      .add(getSubscriptionDuration(subscription))
      .toDate();
  }
}

/**
 * Calculates when the subscription has been paid up until
 *
 * @param payment The failed or cancelled payment
 * @returns The last successful payment's period end or undefined if there isn't one
 */
async function calcFailedPaymentPeriodEnd(
  payment: Payment
): Promise<Date | undefined> {
  const subscriptionId = payment.subscriptionId!; // Definitely exists
  const subscription = await gocardless.subscriptions.get(subscriptionId);

  const latestSuccessfulPayment = await database
    .getRepository(Payment)
    .findOne({
      where: {
        subscriptionId,
        status: PaymentStatus.Successful
      },
      order: { chargeDate: "DESC" }
    });

  if (latestSuccessfulPayment) {
    return moment
      .utc(latestSuccessfulPayment.chargeDate)
      .add(getSubscriptionDuration(subscription))
      .toDate();
  }
}

function getSubscriptionDuration(
  subscription: GCSubscription
): DurationInputObject {
  const unit =
    subscription.interval_unit === SubscriptionIntervalUnit.Yearly
      ? "year"
      : subscription.interval_unit === SubscriptionIntervalUnit.Monthly
        ? "month"
        : "week";
  return {
    [unit]: Number(subscription.interval)
  };
}

export async function updatePaymentStatus(
  paymentId: string,
  gcStatus: GCPaymentStatus
): Promise<void> {
  const status = gocardlessUtils.convertStatus(gcStatus);
  log.info(`Update payment status ${paymentId} to ${status}`);
  await database.getRepository(Payment).update({ id: paymentId }, { status });
}

export async function cancelSubscription(
  subscriptionId: string
): Promise<void> {
  log.info("Cancel subscription " + subscriptionId);

  const contribution = await paymentService.getContributionBy(
    "subscriptionId",
    subscriptionId
  );
  if (contribution) {
    await contactsService.cancelContactContribution(
      contribution.contact,
      "cancelled-contribution",
      currentLocale()
    );
  } else {
    log.info("Unlink subscription " + subscriptionId);
  }
}

export async function cancelMandate(mandateId: string): Promise<void> {
  const contribution = await paymentService.getContributionBy(
    "mandateId",
    mandateId
  );
  if (contribution) {
    log.info("Cancel mandate " + mandateId, {
      contactId: contribution.contact.id,
      mandateId
    });

    await paymentService.updateData(contribution.contact, { mandateId: null });
  } else {
    log.info("Unlinked mandate " + mandateId);
  }
}

async function findOrCreatePayment(
  gcPayment: GCPayment
): Promise<Payment | undefined> {
  const payment = await database.getRepository(Payment).findOne({
    where: { id: gcPayment.id! },
    relations: { contact: true }
  });
  if (payment) {
    return payment;
  }

  const contribution = await paymentService.getContributionBy(
    "mandateId",
    gcPayment.links!.mandate!
  );

  // If not found then the mandate wasn't created by us
  if (contribution) {
    log.info("Create payment " + gcPayment.id, {
      contactId: contribution.contact.id,
      gcPaymentId: gcPayment.id
    });
    const newPayment = new Payment();
    newPayment.id = gcPayment.id!;
    newPayment.contact = contribution.contact;
    if (gcPayment.links?.subscription) {
      newPayment.subscriptionId = gcPayment.links.subscription;
    }
    return newPayment;
  }
}
