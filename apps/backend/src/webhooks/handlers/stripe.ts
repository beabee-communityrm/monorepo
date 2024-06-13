import { PaymentStatus } from "@beabee/beabee-common";
import bodyParser from "body-parser";
import { add } from "date-fns";
import express from "express";
import Stripe from "stripe";

import { database, stripeUtils, log as mainLogger, stripe, wrapAsync, GiftService, contactsService, paymentService } from "@beabee/core";

import { Payment, ContactContribution } from "@beabee/models";

import { config } from "@beabee/config";
import currentLocale from "#locale";

const log = mainLogger.child({ app: "webhook-stripe" });

const app = express();

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
  await GiftService.completeGiftFlow(session.id, currentLocale());
}

// Customer has been deleted, remove any reference to it in our system
async function handleCustomerDeleted(customer: Stripe.Customer) {
  const contribution = await paymentService.getContributionBy(
    "customerId",
    customer.id
  );
  if (contribution) {
    log.info("Delete customer from " + customer.id, {
      customerId: customer.id,
      contactId: contribution.contact.id
    });
    await paymentService.updateData(contribution.contact, { customerId: null });
  }
}

// Checks if the subscription has become incomplete_expired, this means that the
// subscription never properly started (e.g. initial payment failed) so we
// should revoke their membership
async function handleCustomerSubscriptionUpdated(
  subscription: Stripe.Subscription
) {
  if (subscription.status === "incomplete_expired") {
    const contribution = await paymentService.getContributionBy(
      "subscriptionId",
      subscription.id
    );
    if (contribution) {
      log.info(
        `Subscription ${subscription.id} never started, revoking membership from ${contribution.contact.id}`
      );
      await contactsService.revokeContactRole(contribution.contact, "member");
      await paymentService.updateData(contribution.contact, {
        subscriptionId: null
      });
    }
  }
}

// The subscription has been cancelled, send the user a cancellation email
async function handleCustomerSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  log.info("Cancel subscription " + subscription.id);
  const contribution = await paymentService.getContributionBy(
    "subscriptionId",
    subscription.id
  );
  if (contribution) {
    await contactsService.cancelContactContribution(
      contribution.contact,
      "cancelled-contribution",
      currentLocale()
    );
  }
}

// Invoice created or updated, update our equivalent entry in the Payment table
export async function handleInvoiceUpdated(invoice: Stripe.Invoice) {
  const payment = await findOrCreatePayment(invoice);
  if (payment) {
    log.info("Updating payment for invoice " + invoice.id);

    payment.status = invoice.status
      ? stripeUtils.convertStatus(invoice.status)
      : PaymentStatus.Draft; // Not really possible for an updated invoice to have no status
    payment.description = invoice.description || "";
    payment.amount = invoice.total / 100;
    payment.chargeDate = new Date(invoice.created * 1000);

    await database.getRepository(Payment).save(payment);
  }
}

// Invoice has been paid, if this is related to a subscription then extend the
// user's membership to the new end of the subscription
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

  await contactsService.extendContactRole(
    contribution.contact,
    "member",
    add(new Date(line.period.end * 1000), config.gracePeriod)
  );

  if (line.amount === contribution.nextAmount?.chargeable) {
    await contactsService.updateContact(contribution.contact, {
      contributionMonthlyAmount: contribution.nextAmount.monthly
    });
    await paymentService.updateData(contribution.contact, { nextAmount: null });
  }
}

// Payment method has been detached, remove any reference to it in our system
async function handlePaymentMethodDetached(
  paymentMethod: Stripe.PaymentMethod
) {
  const contribution = await paymentService.getContributionBy(
    "mandateId",
    paymentMethod.id
  );
  if (contribution) {
    log.info("Detached payment method " + paymentMethod.id, {
      mandateId: paymentMethod.id,
      contactId: contribution.contact.id
    });
    await paymentService.updateData(contribution.contact, { mandateId: null });
  }
}

// A couple of helpers

async function getContributionFromInvoice(
  invoice: Stripe.Invoice
): Promise<ContactContribution | null> {
  if (invoice.customer) {
    const contribution = await paymentService.getContributionBy(
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

async function findOrCreatePayment(
  invoice: Stripe.Invoice
): Promise<Payment | undefined> {
  const payment = await database.getRepository(Payment).findOneBy({ id: invoice.id });
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
