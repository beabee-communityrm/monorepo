# Payment Data Model

This document describes the current payment data model in beabee, its problems, and potential improvements.

## Current Data Model

### Core Entities

#### Contact Entity
The main user entity that contains basic contribution information:

```typescript
@Entity()
export class Contact {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  
  // Contribution fields (problematic - should be in ContactContribution)
  contributionType: ContributionType;           // None, Manual, Automatic
  contributionPeriod: ContributionPeriod | null; // Monthly, Annually
  contributionMonthlyAmount: number | null;     // Amount in base currency
  
  // Relationships
  contribution: ContactContribution;
  profile: ContactProfile;
  roles: ContactRole[];
}
```

**Location**: `packages/core/src/models/Contact.ts`

#### ContactContribution Entity
Payment-specific data for each contact:

```typescript
@Entity()
export class ContactContribution {
  contactId: string;              // Primary key, references Contact.id
  contact: Contact;               // One-to-one relationship
  
  method: PaymentMethod | null;   // Payment method type
  customerId: string | null;      // Provider customer ID
  mandateId: string | null;       // Payment method/mandate ID
  subscriptionId: string | null;  // Subscription ID
  payFee: boolean | null;         // Whether user pays processing fees
  nextAmount: { chargeable: number; monthly: number } | null; // Pending changes
  cancelledAt: Date | null;       // Cancellation timestamp
}
```

**Location**: `packages/core/src/models/ContactContribution.ts`

#### JoinFlow Entity
Manages payment setup flows:

```typescript
@Entity()
export class JoinFlow {
  id: string;
  date: Date;
  paymentFlowId: string;    // Provider-specific flow ID
  loginUrl: string;         // Post-setup login URL
  setPasswordUrl: string;   // Password setup URL
  confirmUrl: string;       // Confirmation URL
  joinForm: JoinForm;       // Embedded form data
}
```

**Location**: `packages/core/src/models/JoinFlow.ts`

#### JoinForm (Embedded)
Form data for join flows:

```typescript
export class JoinForm implements PaymentForm, ReferralGiftForm {
  email: string;
  password: Password;
  firstname?: string;
  lastname?: string;
  
  // Payment data
  monthlyAmount: number;
  period: ContributionPeriod;
  paymentMethod: PaymentMethod;
  payFee: boolean;
  prorate: boolean;
  
  // Optional fields
  vatNumber?: string;
  referralCode?: string;
  referralGift?: string;
  referralGiftOptions?: Record<string, string>;
}
```

**Location**: `packages/core/src/models/JoinForm.ts`

### Supporting Types

#### PaymentMethod Enum
```typescript
export enum PaymentMethod {
  StripeCard = 's_card',
  StripeSEPA = 's_sepa',
  StripeBACS = 's_bacs',
  StripePayPal = 's_paypal',
  StripeIdeal = 's_ideal',
  GoCardlessDirectDebit = 'gc_direct-debit',
}
```

#### ContributionType Enum
```typescript
export enum ContributionType {
  None = 'None',
  Manual = 'Manual',
  Automatic = 'Automatic',
}
```

#### ContributionPeriod Enum
```typescript
export enum ContributionPeriod {
  Monthly = 'monthly',
  Annually = 'annually',
}
```

## Data Model Problems

### 1. Poor Separation of Concerns

**Problem**: Payment data is split between `Contact` and `ContactContribution` without clear logic.

**Current Split**:
- `Contact`: High-level contribution metadata (type, period, amount)
- `ContactContribution`: Provider-specific data (IDs, payment method)

**Issues**:
- Contribution logic ends up in `ContactsService` instead of payment services
- Updates require touching both models
- Inconsistent data access patterns
- Unclear ownership of contribution operations

**Example of Problematic Code**:
```typescript
// In ContactsService - should be in PaymentService
async forceUpdateContactContribution(
  contact: Contact,
  data: ForceUpdateContribution
): Promise<void> {
  // Updates Contact fields
  await this.updateContact(contact, {
    contributionType: data.type,
    contributionPeriod: period,
    contributionMonthlyAmount: monthlyAmount,
  });

  // Updates ContactContribution fields
  await PaymentService.updateData(contact, {
    mandateId: data.source || null,
    customerId: data.reference || null,
  });
}
```

### 2. Redundant Type Information

**Problem**: `Contact.contributionType` and `ContactContribution.method` overlap significantly.

**Current Logic**:
- If `method` is any Stripe method → `contributionType` should be `Automatic`
- If `method` is GoCardless → `contributionType` should be `Automatic`
- If `method` is `null` and `contributionType` is `Manual` → manual payment
- If `method` is `null` and `contributionType` is `None` → no contribution

**Issues**:
- Redundant information stored in two places
- Potential for inconsistent states
- Complex validation logic required
- Business logic spread across multiple models

### 3. No Historical Data

**Problem**: Only current state is stored, no history of changes.

**Missing Information**:
- Previous subscription IDs after cancellation
- Payment method change history
- Contribution amount change timeline
- Cancellation and reactivation events

**Current Workaround**:
```typescript
// Brittle solution for pending changes
nextAmount: { chargeable: number; monthly: number } | null;
```

**Impact**:
- Lost payment provider IDs after cancellation
- No audit trail for compliance
- Difficult debugging of payment issues
- Edge cases with payment timing

### 4. Embedded JoinForm Complexity

**Problem**: `JoinForm` is embedded in `JoinFlow` but contains heterogeneous data.

**Issues**:
- Mix of user data, payment data, and flow data
- Not reusable for other payment flows
- Difficult to validate individual components
- Complex serialization/deserialization

## Provider Integration Issues

### 1. Provider-Specific Data Storage

**Current Approach**: Each provider stores data differently in the same `ContactContribution` fields.

**Stripe Usage**:
- `customerId`: Stripe Customer ID
- `mandateId`: Stripe Payment Method ID
- `subscriptionId`: Stripe Subscription ID

**GoCardless Usage**:
- `customerId`: GoCardless Customer ID
- `mandateId`: GoCardless Mandate ID
- `subscriptionId`: Not used (GoCardless uses mandates)

**Manual Usage**:
- `customerId`: Payment reference
- `mandateId`: Payment source
- `subscriptionId`: Not used

**Problems**:
- Fields have different meanings per provider
- Validation rules are provider-dependent
- Generic queries are difficult
- Provider switching is complex

### 2. Provider Selection Logic

**Current Implementation**:
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
- Provider selected by payment method rather than actual provider
- Multiple payment methods map to same provider
- Switching payment methods within a provider requires full provider switch
- Unnecessary complexity for intra-provider changes

## Database Schema Issues

### 1. Nullable Fields Without Clear Semantics

Many fields in `ContactContribution` are nullable, but the business rules for when they should be null are complex:

```typescript
method: PaymentMethod | null;        // null for no contribution
customerId: string | null;           // null for no provider account
mandateId: string | null;            // null for no payment method
subscriptionId: string | null;       // null for manual/GoCardless
payFee: boolean | null;              // null for no contribution
nextAmount: {...} | null;            // null for no pending changes
cancelledAt: Date | null;            // null for active contributions
```

### 2. One-to-One Relationship Complexity

The `Contact` ↔ `ContactContribution` one-to-one relationship creates several issues:

- Requires careful cascade management
- Orphaned records possible
- Complex queries for contribution data
- Difficult to extend with additional payment accounts

### 3. Migration Complexity

The current structure makes migrations difficult:

- Data split across multiple tables
- Referential integrity constraints
- Provider-specific data formats
- Historical data preservation challenges

## Querying and Performance Issues

### 1. Join Requirements

Most payment-related queries require joins between `Contact` and `ContactContribution`:

```sql
-- Get all active contributors
SELECT c.*, cc.*
FROM contact c
JOIN contact_contribution cc ON c.id = cc.contactId
WHERE c.contributionType != 'None'
  AND cc.cancelledAt IS NULL;
```

### 2. Filter Complexity

Filtering by payment status requires complex logic:

```typescript
// From filter-handlers/contact.filter-handlers.ts
function contributionField(field: keyof ContactContribution): FilterHandler {
  return (qb, { fieldPrefix, convertToWhereClause }) => {
    const subQb = createQueryBuilder()
      .subQuery()
      .select(`cc.contactId`)
      .from(ContactContribution, 'cc')
      .where(convertToWhereClause(`cc.${field}`));

    qb.where(`${fieldPrefix}id IN ${subQb.getQuery()}`);
  };
}
```

### 3. Inconsistent Access Patterns

Different parts of the codebase access payment data differently:

- Some query `Contact` fields directly
- Others join with `ContactContribution`
- Services have different patterns for updates
- Frontend components use different API endpoints

## Proposed Improvements

### 1. Unified Payment Entity

**Concept**: Merge payment-related fields into a single, well-structured entity.

**Benefits**:
- Clear ownership of payment data
- Consistent access patterns
- Simplified queries
- Better encapsulation

### 2. Payment History Tracking

**Concept**: Add historical tracking for payment changes.

**Benefits**:
- Audit trail for compliance
- Better debugging capabilities
- Recovery of lost provider IDs
- Support for complex payment flows

### 3. Provider-Agnostic Storage

**Concept**: Store provider-specific data in a more flexible format.

**Benefits**:
- Easier provider switching
- Support for multiple payment methods per user
- Cleaner provider implementations
- Better extensibility

### 4. Simplified Flow Management

**Concept**: Create generic payment flows that can be reused.

**Benefits**:
- Reusable for different payment scenarios
- Cleaner API design
- Reduced complexity
- Better error handling

## Migration Strategy

Any improvements to the data model must consider:

1. **Backward Compatibility**: Existing data must be preserved
2. **Gradual Migration**: Changes should be incremental
3. **Zero Downtime**: Migrations must not interrupt service
4. **Data Integrity**: No loss of payment or user data
5. **Provider Continuity**: Active subscriptions must continue working

For detailed migration plans, see [improvement-plan.md](./improvement-plan.md).

## References

- **Models**: `packages/core/src/models/`
- **Services**: `packages/core/src/services/PaymentService.ts`, `ContactsService.ts`
- **Providers**: `packages/core/src/providers/payment/`
- **Types**: `packages/common/src/types/`
- **Migrations**: `packages/core/src/migrations/` (especially `FlattenContributionData1713434533086`)
