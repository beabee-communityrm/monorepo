# Payment System Problems

This document outlines the current problems with beabee's payment system that need to be addressed in future refactoring efforts.

## Overview

The current payment system has several architectural and implementation issues that make it difficult to maintain, extend, and debug. These problems stem from poor separation of concerns, data model inconsistencies, and provider-specific complexity.

## Data Model Problems

### 1. ContactContribution vs Contact Field Separation

**Problem**: Payment data is split between the `Contact` model and `ContactContribution` model, indicating poor logical separation.

**Current State**:

- `Contact` has fields: `contributionType`, `contributionPeriod`, `contributionMonthlyAmount`
- `ContactContribution` has fields: `method`, `customerId`, `mandateId`, `subscriptionId`, `payFee`, `nextAmount`, `cancelledAt`

**Issues**:

- Contribution logic ends up in `ContactsService` instead of payment-specific services
- Data consistency problems between the two models
- Unclear ownership of contribution-related operations
- Migration complexity when moving between models

**Code References**:

- `packages/core/src/models/Contact.ts` (lines 59-66)
- `packages/core/src/models/ContactContribution.ts`
- `packages/core/src/services/ContactsService.ts` (forceUpdateContactContribution method)

### 2. Overlapping Type and Method Fields

**Problem**: `Contact.contributionType` and `ContactContribution.method` largely overlap.

**Current State**:

- `contributionType`: `None`, `Manual`, `Automatic`
- `method`: `s_card`, `s_sepa`, `s_bacs`, `s_paypal`, `s_ideal`, `gc_direct-debit`

**Issues**:

- A Stripe payment method always implies an automatic contribution
- Redundant information stored in two places
- Logic needs to check both fields to determine payment state
- Potential for inconsistent states

**Code References**:

- `packages/common/src/data/payment-method.ts`
- `packages/common/src/data/contribution-type.ts`

### 3. No ContactContribution History

**Problem**: Each Contact has only one ContactContribution record, so changes are overwritten with no history.

**Current Issues**:

- Lost payment IDs when contributions are cancelled
- No tracking of subscription changes over time
- Problematic for contributions with pending changes (e.g., non-prorated annual changes)
- Final payments ignored if cancelled before completion (especially GoCardless)
- `nextAmount` field is a brittle workaround for pending changes

**Impact**:

- Lost `subscriptionId` after cancellation
- No audit trail for payment changes
- Difficulty debugging payment issues
- Edge cases with payment timing and cancellation

**Code References**:

- `packages/core/src/models/ContactContribution.ts` (lines 30-31: nextAmount field)

## Provider Implementation Problems

### 1. Payment Provider by Payment Type

**Problem**: Payment provider is selected per payment type rather than per actual provider.

**Current State**:

```typescript
const PaymentProviders = {
  [PaymentMethod.StripeCard]: StripeProvider,
  [PaymentMethod.StripeSEPA]: StripeProvider,
  [PaymentMethod.StripeBACS]: StripeProvider,
  [PaymentMethod.StripePayPal]: StripeProvider,
  [PaymentMethod.StripeIdeal]: StripeProvider,
  [PaymentMethod.GoCardlessDirectDebit]: GCProvider,
};
```

**Issues**:

- Most payment types use the same provider (StripeProvider)
- Switching between payment types within one provider is complicated
- PaymentService thinks it needs to completely cancel and recreate subscriptions
- Should be able to switch payment methods within the same provider more easily

**Code References**:

- `packages/core/src/services/PaymentService.ts` (lines 25-32)

### 2. Provider Logic Duplication

**Problem**: PaymentProvider implementations manage too much ContactContribution logic with significant duplication.

**Issues**:

- Each provider duplicates similar database update logic
- Complex state management spread across providers
- Difficult to maintain consistency across providers
- Provider-specific quirks leak into general payment logic

**Code References**:

- `packages/core/src/providers/payment/StripeProvider.ts`
- `packages/core/src/providers/payment/GCProvider.ts`
- `packages/core/src/providers/payment/ManualProvider.ts`

### 3. Manual Contribution Handling

**Problem**: Manual contributions are handled differently from Stripe/GoCardless with ugly workarounds.

**Current Issues**:

- `ContactsService.forceUpdateContactContribution` method exists specifically for manual contributions
- Method is marked as deprecated with TODO to remove
- Inconsistent API between manual and automatic contribution updates
- Manual contributions bypass normal payment flow validation

**Code References**:

- `packages/core/src/services/ContactsService.ts` (lines 428-458)
- `apps/frontend/src/pages/admin/contacts/[id]/contribution.vue` (lines 119-129)

## Join Flow Problems

### 1. Excessive and Unused Fields

**Problem**: The `JoinFlow` model has many fields that are only used in specific scenarios.

**Current State**:

```typescript
@Entity()
export class JoinFlow {
  id: string;
  date: Date;
  paymentFlowId: string;
  loginUrl: string;
  setPasswordUrl: string;
  confirmUrl: string;
  joinForm: JoinForm;
}
```

**Issues**:

- Random values assigned to satisfy constraints in scenarios where fields aren't needed
- Risk of join flows created for one purpose being used for another
- Has been fixed in frontend but still possible via API
- Not generic enough for reuse in different payment scenarios

**Code References**:

- `packages/core/src/models/JoinFlow.ts`
- `packages/core/src/services/PaymentFlowService.ts` (lines 64-77)

### 2. Limited Reusability

**Problem**: Join flow is not generic enough for different payment scenarios.

**Issues**:

- Designed specifically for user registration
- Cannot easily be reused for:
  - Payment method changes
  - Subscription updates
  - Contribution amount changes
- Should be more like a generic "payment intent flow"

## Stripe-Specific Problems

### 1. SetupIntent vs PaymentIntent Confusion

**Problem**: The join flow uses SetupIntent logic instead of PaymentIntent for initial payments.

**Current Implementation**:

- SetupIntent is used for payment method authorization
- Shows as €0 charge in banking apps
- Confusing for users signing up for paid contributions (e.g., €32/year)

**Better Approach**:

- PaymentIntent can handle both immediate and future charges
- Would show correct amount for initial subscription charge
- More appropriate for contribution sign-ups

**Code References**:

- `packages/core/src/providers/payment-flow/StripeFlowProvider.ts` (lines 36-49)
- `apps/frontend/src/components/StripePayment.vue` (lines 160-173)

### 2. Payment Method Switching Complexity

**Problem**: Switching between Stripe payment methods is unnecessarily complex.

**Current State**:

- System treats different Stripe payment types as different providers
- Requires full subscription cancellation and recreation
- Should be simpler within the same provider ecosystem

## Date Calculation Issues

### 1. Contribution Date Calculations

**Problem**: Contribution date calculations are inconsistent and error-prone.

**Issues**:

- Complex logic spread across multiple services
- Difficult to predict renewal dates
- Proration calculations are brittle
- Edge cases not well handled

**Impact**:

- User confusion about billing dates
- Accounting discrepancies
- Difficult to debug billing issues

## Historical Context

### Related Work

- **GitHub PR #42**: Previous attempt to clean up these issues
- **Mural Documentation**: Visual documentation of payment system complexity
  - URL: https://app.mural.co/t/beabee6721/m/beabee6721/1651065526558/7e52f76fd91d54d92b1afd6650d4e203c2ab8153

### Migration History

- `FlattenContributionData1713434533086`: Migration that attempted to address some data separation issues
- Multiple join flow migrations indicate ongoing structural problems

## Impact Assessment

### Development Impact

- High maintenance burden
- Difficult to add new payment providers
- Complex debugging process
- Risk of data inconsistencies

### User Impact

- Confusing payment authorization flows
- Limited payment method flexibility
- Potential billing errors
- Poor error recovery experience

### Business Impact

- Difficulty scaling payment operations
- Risk of lost revenue from failed payments
- Compliance and audit trail challenges
- Technical debt accumulation

## Next Steps

This problems documentation should be used to:

1. **Prioritize Refactoring**: Focus on high-impact, low-risk improvements first
2. **Design Solutions**: Use this analysis to design better architectural patterns
3. **Plan Migrations**: Ensure data migration strategies address root causes
4. **Prevent Regression**: Avoid reintroducing these patterns in new code

For proposed solutions, see [improvement-plan.md](./improvement-plan.md).
