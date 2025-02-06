# Payment Webhooks

## Overview
The webhooks system processes payment-related events from providers to update payment statuses and handle provider notifications.

## Webhook Server
- Dedicated Express server handling provider webhooks
- Located in `apps/webhooks/`
- Separate from main backend for reliability and scalability
- Configurable through environment options

## Provider Webhooks

### Stripe Events
**Implementation:** See `apps/webhooks/src/handlers/stripe.ts`

1. **Payment Events**
   - Checkout session completion
   - Customer lifecycle (deletion, subscription changes)
   - Invoice lifecycle (creation, updates, payment)
   - Payment method changes

2. **Key Workflows**
   - Gift payment completion
   - Subscription status management
   - Invoice tax rate handling
   - Payment record synchronization
   - Membership extension on payment

3. **Security**
   - Signature verification using webhook secret
   - Event replay protection
   - Error handling with proper status codes

### GoCardless Events
**Implementation:** See `apps/webhooks/src/handlers/gocardless.ts`

1. **Payment Events**
   - Payment status changes
   - Mandate lifecycle
   - Subscription changes
   - Refund processing

2. **Key Workflows**
   - Payment status synchronization
   - Mandate management
   - Subscription cancellation
   - Payment confirmation and extension
   - Failed payment handling

3. **Security**
   - Webhook secret validation
   - Event verification
   - Feature flag control

## Data Synchronization

### Payment Updates
- Status tracking
- Amount and description updates
- Charge date management
- Refund handling

### Membership Management
- Role extension on successful payments
- Revocation on failed payments
- Contribution amount updates
- Cancellation processing

### Error Recovery
- Failed webhook handling
- Event redelivery support
- Manual intervention tools
- Resync utilities for data repair

## Local Development

### Setup
1. Configure webhook endpoints in provider dashboards
2. Set required environment variables
3. Enable webhook feature flags
4. Configure webhook secrets

### Testing
- Use provider test events
- Local webhook forwarding
- Event simulation
- Monitor webhook processing

For implementation details and configurations, see the webhook handlers in `apps/webhooks/src/handlers/`. 
