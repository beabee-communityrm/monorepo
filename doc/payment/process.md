# Payment Process Documentation

## Overview

This document describes the complete payment process in beabee, from initial user interaction to successful payment setup and ongoing payment handling.

## Process Flow

### 1. Initial Join Flow (Client)

1. User fills out join form with:
   - Personal information
   - Payment amount
   - Payment period (monthly/yearly)
   - Payment method selection

2. Frontend sends join request:
~~~typescript
POST /api/join
Body: {
  email: string;
  password: string;
  firstname?: string;
  lastname?: string;
  monthlyAmount: number;
  period: ContributionPeriod;
  paymentMethod: PaymentMethod;
}
~~~

### 2. Join Flow Creation (Server)

1. `PaymentFlowService` creates join flow:
~~~typescript
const joinFlow = await paymentFlowService.createPaymentJoinFlow(
  joinForm,
  urls,
  completeUrl,
  userData
);
~~~

2. Based on payment method, appropriate provider is selected:
   - Stripe methods → `StripeFlowProvider`
   - GoCardless → `GCFlowProvider`
   - Manual → No flow needed

### 3. Payment Setup (Provider-specific)

#### Stripe Flow
1. Server creates SetupIntent:
~~~typescript
const setupIntent = await stripe.setupIntents.create({
  payment_method_types: [paymentMethodToStripeType(paymentMethod)]
});
~~~

2. Client receives setupIntent.client_secret
3. Frontend initializes Stripe Elements
4. User enters payment details
5. Stripe.js confirms setup

#### GoCardless Flow
1. Server creates redirect flow:
~~~typescript
const redirectFlow = await gocardless.redirectFlows.create({
  session_token: joinFlow.id,
  success_redirect_url: completeUrl,
  prefilled_customer: customerData
});
~~~

2. Client redirects to GoCardless
3. User enters bank details
4. GoCardless redirects back to success URL

### 4. Payment Completion (Server)

1. Provider confirms setup:
~~~typescript
// Stripe
const setupIntent = await stripe.setupIntents.retrieve(flowId);
const paymentMethodId = setupIntent.payment_method;

// GoCardless
const redirectFlow = await gocardless.redirectFlows.complete(flowId);
const mandateId = redirectFlow.links.mandate;
~~~

2. `PaymentFlowService` completes join flow:
~~~typescript
const completedFlow = await paymentFlowService.completeJoinFlow(joinFlow);
~~~

3. Payment method attached to contact:
~~~typescript
await PaymentService.updatePaymentMethod(contact, completedFlow);
~~~

### 5. Subscription Setup (Server)

1. Create customer if needed:
~~~typescript
// Stripe
const customer = await stripe.customers.create({
  email: contact.email,
  payment_method: paymentMethodId
});

// GoCardless
const customer = await gocardless.customers.get(customerId);
~~~

2. Create subscription:
~~~typescript
// Stripe
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price_data: priceData }],
  payment_behavior: 'default_incomplete'
});

// GoCardless
const subscription = await gocardless.subscriptions.create({
  amount: amount,
  currency: 'EUR',
  interval_unit: period,
  links: { mandate: mandateId }
});
~~~

## Webhook Handling

### Stripe Webhooks

1. **checkout.session.completed**
   - Confirms successful payment setup
   - Updates contact status

2. **customer.subscription.updated**
   - Updates subscription status
   - Handles payment changes

3. **invoice.paid**
   - Records successful payment
   - Updates contribution status

4. **payment_intent.payment_failed**
   - Handles failed payments
   - Triggers retry process

### GoCardless Webhooks

1. **mandates**
   - `mandates.created`: Confirms setup
   - `mandates.failed`: Handles setup failures

2. **payments**
   - `payments.confirmed`: Records success
   - `payments.failed`: Handles failures
   - `payments.cancelled`: Updates status

## Error Handling

1. **Setup Failures**
   - Invalid payment details
   - Failed mandate setup
   - Network errors

2. **Payment Failures**
   - Insufficient funds
   - Expired cards
   - Cancelled mandates

3. **Recovery Process**
   - Automatic retry scheduling
   - User notification
   - Manual intervention options

## Testing Considerations

1. **Setup Testing**
   - Test card numbers
   - Bank account details
   - Error scenarios

2. **Webhook Testing**
   - Local webhook testing
   - Event simulation
   - Error handling

3. **Integration Testing**
   - Complete flow testing
   - Provider-specific scenarios
   - Error recovery testing

## Related Documentation
- [Payment Flow](./flow.md)
- [Payment Providers](./providers.md)
- [Stripe Integration](./stripe.md) 
