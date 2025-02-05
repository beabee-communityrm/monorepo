# Stripe Integration Documentation

## Overview

The Stripe integration in beabee is split into two separate providers:

1. `StripeProvider` - Implements the `PaymentProvider` interface for payment operations
2. `StripeFlowProvider` - Implements the `PaymentFlowProvider` interface for payment setup flows

## Package Structure

Located in `packages/core/src/providers/`:
- `payment/StripeProvider.ts` - Payment provider implementation
- `payment-flow/StripeFlowProvider.ts` - Payment flow provider implementation 
- `webhooks/stripe/` - Webhook handlers

## Payment Methods Supported

The StripeProvider handles these payment methods:
~~~typescript
const PaymentMethods = {
  [PaymentMethod.StripeCard]: 'card',
  [PaymentMethod.StripeSEPA]: 'sepa_debit',
  [PaymentMethod.StripeBACS]: 'bacs_debit',
  [PaymentMethod.StripePayPal]: 'paypal',
  [PaymentMethod.StripeIdeal]: 'ideal'
} as const;
~~~

## Provider Implementations

### 1. StripeProvider (Payment Provider)
Handles ongoing payment operations:
~~~typescript
class StripeProvider extends PaymentProvider {
  async updateContribution(paymentForm: PaymentForm): Promise<UpdateContributionResult>;
  async cancelContribution(keepMandate: boolean): Promise<void>;
  async updatePaymentMethod(completedPaymentFlow: CompletedPaymentFlow): Promise<void>;
  // ... other methods
}
~~~

### 2. StripeFlowProvider (Payment Flow Provider)
Handles the initial payment setup flow:
~~~typescript
class StripeFlowProvider implements PaymentFlowProvider {
  async createPaymentFlow(joinFlow: JoinFlow): Promise<PaymentFlow>;
  async completePaymentFlow(joinFlow: JoinFlow): Promise<CompletedPaymentFlow>;
  async getCompletedPaymentFlowData(completedPaymentFlow: CompletedPaymentFlow): Promise<CompletedPaymentFlowData>;
}
~~~

## Stripe Features Used

1. **Payment Methods**
- Card payments
- SEPA Direct Debit
- BACS Direct Debit
- PayPal
- iDEAL

2. **Subscriptions**
- Recurring billing
- Subscription management
- Proration handling

3. **Customers**
- Customer management
- Payment method attachment
- Billing information storage

4. **Invoices**
- Invoice generation
- Tax rate handling
- Payment tracking

## Payment Flow

### 1. Setup Intent Creation
~~~typescript
// In StripeProvider (payment-flow)
async createPaymentFlow(joinFlow: JoinFlow): Promise<PaymentFlow> {
  const setupIntent = await stripe.setupIntents.create({
    payment_method_types: [
      paymentMethodToStripeType(joinFlow.joinForm.paymentMethod)
    ]
  });
  
  return {
    id: setupIntent.id,
    params: {
      clientSecret: setupIntent.client_secret as string
    }
  };
}
~~~

### 2. Payment Method Setup
- Client collects payment details using Stripe Elements
- Payment method is created and attached to SetupIntent
- For iDEAL payments, converts to SEPA Direct Debit

### 3. Customer Creation/Update
~~~typescript
// In StripeProvider (payment)
async updatePaymentMethod(flow: CompletedPaymentFlow): Promise<void> {
  // Create or update customer
  if (this.data.customerId) {
    await stripe.paymentMethods.attach(flow.mandateId, {
      customer: this.data.customerId
    });
  } else {
    const customer = await stripe.customers.create({
      email: this.contact.email,
      name: `${this.contact.firstname} ${this.contact.lastname}`,
      payment_method: flow.mandateId
    });
    this.data.customerId = customer.id;
  }
}
~~~

### 4. Subscription Creation
~~~typescript
// In stripe.ts
export async function createSubscription(
  customerId: string,
  paymentForm: PaymentForm,
  paymentMethod: PaymentMethod,
  renewalDate?: Date
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price_data: getPriceData(paymentForm, paymentMethod) }],
    off_session: true,
    default_tax_rates: getSalesTaxRateObject()
  });
}
~~~

## Webhook Handling

The webhooks app handles the following Stripe events:

~~~typescript
// In webhooks/src/handlers/stripe.ts
switch (evt.type) {
  case "checkout.session.completed":
  case "customer.deleted":
  case "customer.subscription.updated":
  case "customer.subscription.deleted":
  case "invoice.created":
  case "invoice.updated":
  case "invoice.paid":
  case "payment_method.detached":
}
~~~

Key webhook functionalities:
- Subscription status updates
- Invoice handling
- Payment status tracking
- Customer deletion handling

## Special Features

### Tax Rate Management
~~~typescript
// In stripe.ts
export async function updateSalesTaxRate(percentage: number): Promise<void> {
  const taxRate = await stripe.taxRates.create({
    percentage: percentage,
    active: true,
    inclusive: true,
    display_name: currentLocale().taxRate.invoiceName
  });
}
~~~

### Gift Payments
~~~typescript
// In GiftService.ts
static async createGiftFlow(giftForm: GiftForm): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    success_url: config.audience + "/gift/thanks/" + giftFlow.id,
    cancel_url: config.audience + "/gift",
    customer_email: giftForm.fromEmail,
    payment_method_types: ["card"],
    line_items: [/* ... */]
  });
  return session.id;
}
~~~

## Data Synchronization

The `resync-stripe.ts` tool provides functionality to:
- Sync subscription statuses
- Update payment methods
- Reconcile invoice data
- Clean up deleted customers

This ensures the local database stays in sync with Stripe's data.
