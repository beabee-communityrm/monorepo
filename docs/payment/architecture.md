# Payment System Architecture

## Core Components

### Service Layer

- **PaymentService**: Manages ongoing payment operations
  - Contribution management
  - Payment method updates
  - Customer data handling
- **PaymentFlowService**: Handles payment setup flows
  - Flow creation and completion
  - Provider coordination
  - Setup validation

### Provider System

Two types of providers handle different aspects:

#### PaymentProvider

Manages ongoing payment operations:

- Payment processing
- Subscription management
- Contact updates

#### PaymentFlowProvider

Handles initial payment setup:

- Payment method setup
- User authentication
- Provider-specific flows

### Data Model

#### Core Entities

- `Contact`: Main user entity with contribution metadata
- `ContactContribution`: Provider-specific payment data
- `Payment`: Transaction records
- `JoinFlow`: Payment setup process tracking

#### Current Data Model Issues

**Problem 1: Split Payment Data**
Payment information is awkwardly split between `Contact` and `ContactContribution`:

```typescript
// Contact entity has high-level contribution data
Contact {
  contributionType: 'None' | 'Manual' | 'Automatic'
  contributionPeriod: 'monthly' | 'annually' | null
  contributionMonthlyAmount: number | null
}

// ContactContribution has provider-specific data
ContactContribution {
  method: PaymentMethod | null
  customerId: string | null
  mandateId: string | null
  subscriptionId: string | null
  payFee: boolean | null
  nextAmount: {...} | null
  cancelledAt: Date | null
}
```

**Issues**:

- Contribution logic spread across multiple services
- Data consistency challenges
- Complex update operations
- Unclear ownership of payment operations

**Problem 2: Provider Selection by Payment Method**
The system selects providers based on payment method rather than actual provider:

```typescript
const PaymentProviders = {
  [PaymentMethod.StripeCard]: StripeProvider,
  [PaymentMethod.StripeSEPA]: StripeProvider, // Same provider
  [PaymentMethod.StripeBACS]: StripeProvider, // Same provider
  [PaymentMethod.StripePayPal]: StripeProvider, // Same provider
  [PaymentMethod.GoCardlessDirectDebit]: GCProvider,
};
```

**Issues**:

- Switching between Stripe payment methods requires full provider switch
- Unnecessary subscription cancellation and recreation
- Complex state management for simple payment method changes

**Problem 3: No Payment History**
Each contact has only one `ContactContribution` record:

**Issues**:

- Lost payment provider IDs after cancellation
- No audit trail for payment changes
- Difficult debugging of payment issues
- `nextAmount` field is a brittle workaround for pending changes

### Integration Points

- REST API endpoints
- Webhook handlers
- Provider APIs
- Frontend components

## Architectural Problems

### 1. Service Layer Issues

**ContactsService Overreach**:
The `ContactsService` contains payment-specific logic that should be in `PaymentService`:

```typescript
// This should be in PaymentService, not ContactsService
async forceUpdateContactContribution(
  contact: Contact,
  data: ForceUpdateContribution
): Promise<void> {
  // Updates Contact model
  await this.updateContact(contact, { ... });
  // Updates ContactContribution model
  await PaymentService.updateData(contact, { ... });
}
```

**Provider Complexity**:
Each `PaymentProvider` implementation duplicates similar logic for managing `ContactContribution` data, leading to:

- Code duplication across providers
- Inconsistent data handling
- Complex state management
- Difficult maintenance

### 2. Flow Management Issues

**JoinFlow Limitations**:

- Designed specifically for user registration
- Cannot be reused for payment method changes or subscription updates
- Contains many fields that are unused in certain scenarios
- Risk of flows being used for unintended purposes

**SetupIntent vs PaymentIntent**:

- Stripe flow uses `SetupIntent` instead of `PaymentIntent`
- Shows €0 authorization in banking apps instead of actual amount
- Confusing user experience for paid contributions

### 3. Data Access Patterns

**Inconsistent Querying**:
Different parts of the system access payment data differently:

- Some query `Contact` fields directly
- Others require joins with `ContactContribution`
- Filter handlers need complex subqueries
- API endpoints use different data access patterns

**Performance Issues**:

- Most payment queries require joins
- Complex filtering logic
- Inefficient data access patterns
- Lack of proper indexing for payment-related queries

## Current Workarounds

### 1. Manual Contribution Handling

```typescript
// Deprecated method with TODO to remove
async forceUpdateContactContribution(
  contact: Contact,
  data: ForceUpdateContribution
): Promise<void> {
  // Complex logic to handle manual contributions differently
}
```

### 2. Pending Changes Management

```typescript
// Brittle solution for subscription changes
nextAmount: { chargeable: number; monthly: number } | null;
```

### 3. Provider Field Overloading

The same `ContactContribution` fields have different meanings per provider:

- **Stripe**: `customerId` = Customer ID, `mandateId` = Payment Method ID
- **GoCardless**: `customerId` = Customer ID, `mandateId` = Mandate ID
- **Manual**: `customerId` = Reference, `mandateId` = Source

## Recommended Improvements

### 1. Unified Payment Data Model

- Consolidate payment data into a single, well-structured entity
- Add historical tracking for payment changes
- Implement provider-agnostic data storage

### 2. Provider-Aware Architecture

- Recognize when payment methods belong to the same provider
- Implement provider-specific optimization paths
- Separate provider selection from payment method selection

### 3. Generic Flow System

- Create reusable payment flows for different scenarios
- Implement proper error recovery mechanisms
- Support multiple concurrent payment operations

### 4. Improved Service Boundaries

- Move payment logic to `PaymentService`
- Reduce provider implementation complexity
- Implement consistent data access patterns

For detailed analysis of current problems, see [problems.md](./problems.md)
For specific data model issues, see [data-model.md](./data-model.md)
For implementation details, see `packages/core/src/providers/payment/`
