# Payment Flow

## Overview
The payment flow describes how users set up and manage their payment methods and contributions.

## Flow Stages

### 1. Initial Setup
**Browser:**
- User fills join form
- Selects payment method
- Configures contribution

**Backend:**
- Creates join flow record
- Validates user data
- Returns setup parameters

### 2. Provider Setup

#### Stripe Flow
**Browser:**
- Initializes Stripe Elements
- Collects payment details
- Handles payment confirmation

**Backend:**
- Creates SetupIntent
- Validates payment method
- Manages payment tokens

#### GoCardless Flow
**Browser:**
- Redirects to GoCardless
- User authorizes bank
- Returns via redirect URL

**Backend:**
- Creates redirect flow
- Handles customer data
- Processes mandate setup

### 3. Completion
**Backend:**
- Verifies provider setup
- Creates/updates customer
- Attaches payment method
- Sets up contribution
- Sends confirmation email

### Error Handling
- Invalid setup recovery
- Session management
- Provider-specific errors

## Known Issues and Problems

### Stripe SetupIntent vs PaymentIntent

**Current Problem**: The Stripe join flow uses `SetupIntent` instead of `PaymentIntent` for initial payment setup.

**Impact**:
- Banking apps show €0 authorization instead of actual contribution amount
- Confusing for users signing up for paid contributions (e.g., €32/year)
- Users see "future payment authorization" instead of "payment for subscription"

**Current Implementation**:
```typescript
// In StripeFlowProvider.createPaymentFlow()
const setupIntent = await stripe.setupIntents.create({
  payment_method_types: [
    paymentMethodToStripeType(joinFlow.joinForm.paymentMethod),
  ],
});
```

**Better Approach**:
- Use `PaymentIntent` for initial subscription charges
- Can handle both immediate and future payments
- Shows correct amount in banking apps
- More appropriate for contribution sign-ups

**Code References**:
- `packages/core/src/providers/payment-flow/StripeFlowProvider.ts`
- `apps/frontend/src/components/StripePayment.vue`

### Join Flow Limitations

**Current Problems**:
1. **Single-Purpose Design**: `JoinFlow` is designed specifically for user registration
2. **Unused Fields**: Many fields are populated with dummy values when not needed
3. **Limited Reusability**: Cannot easily be used for:
   - Payment method changes
   - Subscription updates
   - Contribution amount changes

**Impact**:
- Code duplication for different payment scenarios
- Risk of flows being used for unintended purposes
- Complex validation logic
- Maintenance burden

### Provider Switching Complexity

**Current Problem**: Switching payment methods within the same provider (e.g., Stripe Card to Stripe SEPA) requires full subscription recreation.

**Current Logic**:
```typescript
// PaymentService treats each payment method as a different provider
const PaymentProviders = {
  [PaymentMethod.StripeCard]: StripeProvider,
  [PaymentMethod.StripeSEPA]: StripeProvider, // Same provider!
  [PaymentMethod.StripeBACS]: StripeProvider, // Same provider!
  // ...
};
```

**Issues**:
- Unnecessary subscription cancellation and recreation
- Risk of payment interruption
- Complex state management
- Poor user experience

**Better Approach**:
- Recognize when payment methods belong to the same provider
- Use provider-native method switching APIs
- Maintain subscription continuity

## Flow Improvements Needed

### 1. Generic Payment Intent Flow

Create a reusable payment flow system that can handle:
- User registration with payment
- Payment method updates
- Subscription changes
- One-time payments

### 2. Provider-Aware Method Switching

Implement logic to:
- Detect when payment methods share the same provider
- Use provider-specific switching mechanisms
- Minimize subscription disruption

### 3. Better Error Recovery

Improve handling of:
- Failed payment setups
- Partial flow completion
- Provider-specific errors
- Network interruptions

For implementation details, see `packages/core/src/services/PaymentFlowService.ts`
