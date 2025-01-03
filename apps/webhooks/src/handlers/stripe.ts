import { PaymentStatus } from "@beabee/beabee-common";
import bodyParser from "body-parser";
import { add } from "date-fns";
import express, { type Express } from "express";
import Stripe from "stripe";

import { getRepository } from "@beabee/core/database";
import { log as mainLogger } from "@beabee/core/logging";
import {
  stripe,
  convertStatus,
  getSalesTaxRateObject
} from "@beabee/core/lib/stripe";
import { wrapAsync } from "@beabee/core/utils/index";

import GiftService from "@beabee/core/services/GiftService";
import ContactsService from "@beabee/core/services/ContactsService";
import PaymentService from "@beabee/core/services/PaymentService";

import { Payment, ContactContribution } from "@beabee/core/models";

import config from "@beabee/core/config";

const log = mainLogger.child({ app: "webhook-stripe" });

const app: Express = express();

app.use(bodyParser.raw({ type: "application/json" }));

app.get("/", (req, res) => res.sendStatus(200));

app.post(
  "/",
  wrapAsync(async (req, res) => {
    const sig = req.headers["stripe-signature"] as string;

    try {
      const evt = stripe.webhooks.constructEvent(
        req.body,
        sig,
        config.stripe.webhookSecret
      );

      log.info(`Got webhook ${evt.id} ${evt.type}`);

      switch (evt.type) {
        case "checkout.session.completed":
          await handleCheckoutSessionCompleted(evt.data.object);
          break;

        case "customer.deleted":
          handleCustomerDeleted(evt.data.object);
          break;

        case "customer.subscription.updated":
          await handleCustomerSubscriptionUpdated(evt.data.object);
          break;

        case "customer.subscription.deleted":
          await handleCustomerSubscriptionDeleted(evt.data.object);
          break;

        case "invoice.created":
          await handleInvoiceCreated(evt.data.object);
          break;

        case "invoice.updated":
          await handleInvoiceUpdated(evt.data.object);
          break;

        case "invoice.paid":
          await handleInvoicePaid(evt.data.object);
          break;

        case "payment_method.detached":
          await handlePaymentMethodDetached(evt.data.object);
      }
    } catch (err: any) {
      log.error(`Got webhook error: ${err.message}`, err);
      return res.status(400).send(`Webhook error: ${err.message}`);
    }

    res.sendStatus(200);
  })
);

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  await GiftService.completeGiftFlow(session.id);
}

/**
 * Customer has been deleted, remove any reference to it in our system
 * @param customer The customer
 */
async function handleCustomerDeleted(customer: Stripe.Customer) {
  const contribution = await PaymentService.getContributionBy(
    "customerId",
    customer.id
  );
  if (contribution) {
    log.info("Delete customer from " + customer.id, {
      customerId: customer.id,
      contactId: contribution.contact.id
    });
    await PaymentService.updateData(contribution.contact, { customerId: null });
  }
}

/**
 * Checks if the subscription has become incomplete_expired, this means that the
 * subscription never properly started (e.g. initial payment failed) so we
 * should revoke their membership.
 * @param subscription
 */
async function handleCustomerSubscriptionUpdated(
  subscription: Stripe.Subscription
) {
  if (subscription.status === "incomplete_expired") {
    const contribution = await PaymentService.getContributionBy(
      "subscriptionId",
      subscription.id
    );
    if (contribution) {
      log.info(
        `Subscription ${subscription.id} never started, revoking membership from ${contribution.contact.id}`
      );
      await ContactsService.revokeContactRole(contribution.contact, "member");
      await PaymentService.updateData(contribution.contact, {
        subscriptionId: null
      });
    }
  }
}

/**
 * The subscription has been cancelled, send the user a cancellation email
 * @param subscription The subscription
 */
async function handleCustomerSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  log.info("Cancel subscription " + subscription.id);
  const contribution = await PaymentService.getContributionBy(
    "subscriptionId",
    subscription.id
  );
  if (contribution) {
    await ContactsService.cancelContactContribution(
      contribution.contact,
      "cancelled-contribution"
    );
  }
}

/**
 * Ensure the invoice has the correct tax rate applied
 * @param invoice The new invoice
 */
async function handleInvoiceCreated(invoice: Stripe.Invoice) {
  const payment = await handleInvoiceUpdated(invoice);
  // Only update the tax rate on invoices that we know about
  if (!payment) return;

  // Can't update non-draft invoices. This should never be a problem as only a
  // subscription's initial invoice is created in a finalised state
  // https://docs.stripe.com/billing/invoices/subscription#update-first-invoice
  if (invoice.status !== "draft") return;

  const taxRateObj = getSalesTaxRateObject();
  const invoiceTaxRateObj = invoice.default_tax_rates.map((rate) => rate.id);

  // If tax rates match then there's nothing to do
  if (
    invoiceTaxRateObj.length === taxRateObj.length &&
    invoiceTaxRateObj.every((rate) => taxRateObj.includes(rate))
  ) {
    return;
  }

  const updateTaxRateObj = taxRateObj.length > 0 ? taxRateObj : "";
  log.info("Updating tax rate on invoice " + invoice.id, {
    oldTaxRate: invoiceTaxRateObj,
    newTaxRate: updateTaxRateObj
  });
  await stripe.invoices.update(invoice.id, {
    default_tax_rates: updateTaxRateObj
  });

  // Update the subscription if it exists
  if (invoice.subscription) {
    const subscriptionId = invoice.subscription as string;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    if (
      subscription.status !== "canceled" &&
      subscription.status !== "incomplete_expired"
    ) {
      log.info(
        `Updating tax rate on subscription ${subscriptionId} with status ${subscription.status}`
      );
      await stripe.subscriptions.update(subscriptionId, {
        default_tax_rates: updateTaxRateObj
      });
    }
  }
}

/**
 * Invoice created or updated, update our equivalent entry in the Payment table
 * @param invoice The invoice
 * @returns The updated payment
 */
export async function handleInvoiceUpdated(invoice: Stripe.Invoice) {
  const payment = await findOrCreatePayment(invoice);
  if (payment) {
    log.info("Updating payment for invoice " + invoice.id);

    payment.status = invoice.status
      ? convertStatus(invoice.status)
      : PaymentStatus.Draft; // Not really possible for an updated invoice to have no status
    payment.description = invoice.description || "";
    payment.amount = invoice.total / 100;
    payment.chargeDate = new Date(invoice.created * 1000);

    return await getRepository(Payment).save(payment);
  }
}

/**
 * Invoice has been paid, if this is related to a subscription then extend the
 * user's membership to the new end of the subscription
 * @param invoice The invoice
 */
export async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const contribution = await getContributionFromInvoice(invoice);
  if (!contribution || !invoice.subscription) {
    return;
  }

  log.info(`Invoice ${invoice.id} was paid`);

  // Unlikely, just log for now
  if (invoice.lines.has_more) {
    log.error(`Invoice ${invoice.id} has too many lines`);
    return;
  }
  // Stripe docs say the subscription will always be the last line in the invoice
  const line = invoice.lines.data.slice(-1)[0];
  if (line.subscription !== invoice.subscription) {
    log.error("Expected subscription to be last line on invoice" + invoice.id);
    return;
  }

  await ContactsService.extendContactRole(
    contribution.contact,
    "member",
    add(new Date(line.period.end * 1000), config.gracePeriod)
  );

  if (line.amount === contribution.nextAmount?.chargeable) {
    await ContactsService.updateContact(contribution.contact, {
      contributionMonthlyAmount: contribution.nextAmount.monthly
    });
    await PaymentService.updateData(contribution.contact, { nextAmount: null });
  }
}

/**
 * Payment method has been detached, remove any reference to it in our system
 * @param paymentMethod The detached payment method
 */
async function handlePaymentMethodDetached(
  paymentMethod: Stripe.PaymentMethod
) {
  const contribution = await PaymentService.getContributionBy(
    "mandateId",
    paymentMethod.id
  );
  if (contribution) {
    log.info("Detached payment method " + paymentMethod.id, {
      mandateId: paymentMethod.id,
      contactId: contribution.contact.id
    });
    await PaymentService.updateData(contribution.contact, { mandateId: null });
  }
}

/**
 * Find the contact contribution associated with an invoice
 * @param invoice The invoice
 * @returns The contact contribution
 */
async function getContributionFromInvoice(
  invoice: Stripe.Invoice
): Promise<ContactContribution | null> {
  if (invoice.customer) {
    const contribution = await PaymentService.getContributionBy(
      "customerId",
      invoice.customer as string
    );
    if (!contribution) {
      log.info("Ignoring invoice with unknown customer " + invoice.id);
    }
    return contribution;
  } else {
    log.info("Ignoring invoice without customer " + invoice.id);
    return null;
  }
}

/**
 * Find the corresponding payment for an invoice, creating it if it doesn't
 * exist. Ignore any invoices from customers we don't recognise
 * @param invoice The invoice
 * @returns The corresponding payment
 */
async function findOrCreatePayment(
  invoice: Stripe.Invoice
): Promise<Payment | undefined> {
  const payment = await getRepository(Payment).findOneBy({ id: invoice.id });
  if (payment) {
    return payment;
  }

  const contribution = await getContributionFromInvoice(invoice);
  if (!contribution) {
    return;
  }

  const newPayment = new Payment();
  newPayment.id = invoice.id;

  log.info(
    `Creating payment for ${contribution.contact.id} with invoice ${invoice.id}`
  );
  newPayment.contact = contribution.contact;
  newPayment.subscriptionId = invoice.subscription as string | null;
  return newPayment;
}

export default app;
