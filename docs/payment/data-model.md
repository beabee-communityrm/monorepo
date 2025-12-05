# Payment Data Model

Current payment data structures, architectural problems, and proposed solutions.

## Current Data Model

### Core Entities

```typescript
// Contact: User entity with contribution metadata
@Entity()
class Contact {
  contributionType: ContributionType;           // None, Manual, Automatic
  contributionPeriod: ContributionPeriod | null; // Monthly, Annually
  contributionMonthlyAmount: number | null;     // Amount in base currency
  contribution: ContactContribution;            // One-to-one relationship
}

// ContactContribution: Provider-specific payment data
@Entity()
class ContactContribution {
  contactId: string;              // Primary key
  method: PaymentMethod | null;   // Payment method type
  customerId: string | null;      // Provider customer ID
  mandateId: string | null;       // Payment method/mandate ID
  subscriptionId: string | null;  // Subscription ID
  payFee: boolean | null;         // User pays processing fees
  nextAmount: {...} | null;       // Pending changes (workaround)
  cancelledAt: Date | null;       // Cancellation timestamp
}

// JoinFlow: Payment setup process tracking
@Entity()
class JoinFlow {
  paymentFlowId: string;    // Provider-specific flow ID
  joinForm: JoinForm;       // Embedded form data (user + payment + referral)
}
```

### Supporting Types

```typescript
enum PaymentMethod {
  StripeCard = "s_card",
  StripeSEPA = "s_sepa",
  StripeBACS = "s_bacs",
  StripePayPal = "s_paypal",
  StripeIdeal = "s_ideal",
  GoCardlessDirectDebit = "gc_direct-debit",
}

enum ContributionType {
  None = "None",
  Manual = "Manual",
  Automatic = "Automatic",
}
enum ContributionPeriod {
  Monthly = "monthly",
  Annually = "annually",
}
```

**Locations**: `packages/core/src/models/Contact*.ts`, `packages/common/src/types/`

## Architectural Problems

### 1. Split Payment Data

Payment information is awkwardly split between `Contact` and `ContactContribution`:

```typescript
// ContactsService contains payment logic (should be in PaymentService)
async forceUpdateContactContribution(contact: Contact, data: ForceUpdateContribution) {
  await this.updateContact(contact, { contributionType, contributionPeriod, contributionMonthlyAmount });
  await PaymentService.updateData(contact, { mandateId, customerId });
}
```

**Issues**: Contribution logic spread across services, complex updates, unclear ownership

### 2. Redundant Type Information

`Contact.contributionType` and `ContactContribution.method` overlap significantly:

- Any Stripe/GoCardless method → `contributionType` should be `Automatic`
- `method` is `null` + `contributionType` is `Manual` → manual payment
- `method` is `null` + `contributionType` is `None` → no contribution

**Issues**: Data stored in two places, potential inconsistency, complex validation

### 3. No Historical Tracking

Only current state stored, no payment history:

- Lost provider IDs after cancellation
- No audit trail for compliance
- Difficult debugging
- Brittle `nextAmount` workaround for pending changes

### 4. Provider Field Overloading

Same `ContactContribution` fields have different meanings per provider:

| Provider   | `customerId` | `mandateId`       | `subscriptionId` |
| ---------- | ------------ | ----------------- | ---------------- |
| Stripe     | Customer ID  | Payment Method ID | Subscription ID  |
| GoCardless | Customer ID  | Mandate ID        | Not used         |
| Manual     | Reference    | Source            | Not used         |

**Issues**: Provider-dependent validation, difficult generic queries, complex switching

### 5. Provider Selection by Payment Method

```typescript
const PaymentProviders = {
  [PaymentMethod.StripeCard]: StripeProvider,
  [PaymentMethod.StripeSEPA]: StripeProvider, // Same provider!
  [PaymentMethod.StripeBACS]: StripeProvider, // Same provider!
  // ...
};
```

**Issues**: Switching Stripe payment methods requires full provider switch and subscription recreation

## Database & Performance Issues

### Schema Problems

- **Complex nullable semantics**: Many `ContactContribution` fields nullable with complex business rules
- **One-to-one relationship overhead**: `Contact` ↔ `ContactContribution` requires careful cascade management
- **Migration complexity**: Data split across tables with referential integrity constraints

### Query Performance

Most payment queries require joins and complex filtering:

```sql
-- Typical payment query
SELECT c.*, cc.* FROM contact c
JOIN contact_contribution cc ON c.id = cc.contactId
WHERE c.contributionType != 'None' AND cc.cancelledAt IS NULL;
```

```typescript
// Complex filter handlers for payment status
function contributionField(field: keyof ContactContribution): FilterHandler {
  return (qb, { fieldPrefix, convertToWhereClause }) => {
    const subQb = createQueryBuilder()
      .subQuery()
      .select(`cc.contactId`)
      .from(ContactContribution, "cc")
      .where(convertToWhereClause(`cc.${field}`));
    qb.where(`${fieldPrefix}id IN ${subQb.getQuery()}`);
  };
}
```

### Inconsistent Access Patterns

- Some services query `Contact` fields directly
- Others require joins with `ContactContribution`
- Different update patterns across services
- Varied API endpoint approaches

## Proposed Solutions

### 1. Unified Payment Entity

Consolidate payment data into single entity with clear ownership, consistent access patterns, and simplified queries.

### 2. Payment History Tracking

Add historical tracking for audit trails, debugging, provider ID recovery, and complex payment flows.

### 3. Provider-Agnostic Storage

Flexible provider data storage enabling easier switching, multiple payment methods per user, and cleaner implementations.

### 4. Generic Flow System

Reusable payment flows for different scenarios with better error handling and reduced complexity.

## Migration Constraints

1. **Backward Compatibility**: Preserve existing data
2. **Zero Downtime**: No service interruption
3. **Provider Continuity**: Active subscriptions must continue
4. **Gradual Migration**: Incremental changes only

_For detailed migration plans, see [improvement-plan.md](./improvement-plan.md)._

## References

- **Models**: `packages/core/src/models/Contact*.ts`
- **Services**: `packages/core/src/services/PaymentService.ts`, `ContactsService.ts`
- **Providers**: `packages/core/src/providers/payment/`
- **Key Migration**: `FlattenContributionData1713434533086` in `packages/core/src/migrations/`
