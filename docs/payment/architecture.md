# Payment System Architecture

## Core Components

### Service Layer

- **PaymentService**: Manages ongoing payment operations, contribution management, and customer data
- **PaymentFlowService**: Handles payment setup flows, provider coordination, and validation

### Provider System

- **PaymentProvider**: Manages payment processing, subscriptions, and contact updates
- **PaymentFlowProvider**: Handles payment method setup, user authentication, and provider-specific flows

### Data Model

- **Contact**: User entity with contribution metadata (`contributionType`, `contributionPeriod`, `contributionMonthlyAmount`)
- **ContactContribution**: Provider-specific data (`method`, `customerId`, `mandateId`, `subscriptionId`)
- **Payment**: Transaction records
- **JoinFlow**: Payment setup process tracking with embedded `JoinForm`

_See [data-model.md](./data-model.md) for detailed analysis of current problems and proposed solutions._

## Integration Points

- REST API endpoints for payment operations
- Webhook handlers for provider events
- Provider APIs (Stripe, GoCardless)
- Frontend payment components

## Current Problems

### Service Boundaries

- `ContactsService` contains payment logic that belongs in `PaymentService`
- Provider implementations duplicate `ContactContribution` management logic
- Inconsistent data access patterns across services

### Flow Management

- `JoinFlow` designed only for registration, not reusable for payment updates
- Stripe uses `SetupIntent` showing €0 instead of actual amount
- No support for concurrent payment operations

### Data Access

- Payment queries require complex joins between `Contact` and `ContactContribution`
- Filter handlers need subqueries for payment status
- Performance issues from inefficient access patterns

## Current Workarounds

**Provider Field Overloading**: Same `ContactContribution` fields have different meanings:

- **Stripe**: `customerId` = Customer ID, `mandateId` = Payment Method ID
- **GoCardless**: `customerId` = Customer ID, `mandateId` = Mandate ID
- **Manual**: `customerId` = Reference, `mandateId` = Source

**Pending Changes**: Brittle `nextAmount` field for subscription modifications

**Deprecated Methods**: `forceUpdateContactContribution()` with TODO to remove

## Improvement Strategy

1. **Unified Data Model**: Consolidate payment data, add history tracking
2. **Provider-Aware Architecture**: Optimize same-provider payment method switches
3. **Generic Flows**: Reusable payment flows for different scenarios
4. **Clear Service Boundaries**: Move payment logic to appropriate services

_For detailed problem analysis, see [problems.md](./problems.md). For implementation details, see `packages/core/src/providers/payment/`_
