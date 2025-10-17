# Payment System Improvement Plan

This document outlines a structured approach to resolving the payment system problems documented in [problems.md](./problems.md). The plan is based on lessons learned from [PR #42](https://github.com/beabee-communityrm/monorepo/pull/42), which was a previous attempt to address these issues.

## Historical Context: PR #42 Analysis

**PR #42: "feat: contact contribution history"** was a comprehensive attempt to refactor the payment system that was closed in April 2025 without being merged. The PR introduced several key concepts that should inform our improvement strategy:

### What PR #42 Attempted

1. **Many-to-One Relationship**: Changed `ContactContribution` from one-to-one to many-to-one with `Contact`
2. **Status Field**: Added `status` field with values: `pending`, `current`, `null`
3. **Historical Tracking**: Enabled multiple contribution records per contact
4. **Data Consolidation**: Moved contribution data from `Contact` to `ContactContribution`
5. **Provider Interface Redesign**: Refactored provider methods to be more consistent

### Key Changes from PR #42

```typescript
// New ContactContribution structure
@Entity()
@Unique(["contactId", "status"])
export class ContactContribution {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  contactId!: string;
  @ManyToOne("Contact", "contributions")
  contact!: Contact;

  @Column({ type: String, nullable: true })
  status!: "pending" | "current" | null;

  @Column({ type: String })
  method!: PaymentMethod; // Now includes None and Manual

  @Column({ type: Number, nullable: true })
  monthlyAmount!: number | null;

  @Column({ type: String, nullable: true })
  period!: ContributionPeriod | null;

  // Removed nextAmount field - replaced with pending status
}
```

### Why PR #42 Was Not Merged

The PR was marked as a draft and remained incomplete with several TODO items:

- New webhook processing logic
- Migration of `nextAmount` field
- Removal of `contributionType`

The scope was very large (32 commits, 62 files changed, 1236 additions, 889 deletions), making it difficult to review and merge safely.

## Lessons Learned

1. **Incremental Approach**: Large refactors are difficult to review and merge
2. **Webhook Complexity**: Payment webhooks require careful handling during transitions
3. **Migration Challenges**: Data migration must be foolproof for production systems
4. **Testing Requirements**: Comprehensive testing needed for payment system changes

## Recommended Improvement Strategy

### Phase 1: Foundation and Planning (Low Risk)

**Goal**: Establish foundation for future improvements without breaking changes

#### 1.1 Documentation and Analysis

- ✅ **Complete**: Comprehensive problem documentation
- ✅ **Complete**: Data model analysis
- ✅ **Complete**: Provider interface analysis
- **TODO**: Create migration strategy document
- **TODO**: Set up comprehensive test coverage for payment flows

#### 1.2 Code Quality Improvements

- **TODO**: Add comprehensive integration tests for payment providers
- **TODO**: Improve error handling and logging in payment flows
- **TODO**: Add TypeScript strict mode compliance for payment modules

#### 1.3 Monitoring and Observability

- **TODO**: Add detailed metrics for payment operations
- **TODO**: Implement payment flow tracing
- **TODO**: Create payment system health checks

### Phase 2: Interface Improvements (Medium Risk)

**Goal**: Improve provider interfaces without changing data models

#### 2.1 Provider Interface Standardization

Based on PR #42's provider improvements:

```typescript
// New standardized provider interface
interface PaymentProvider {
  canChangeContribution(
    contribution: ContactContribution,
    useExistingMandate: boolean,
    paymentForm: PaymentForm,
  ): Promise<boolean>;

  getContributionInfo(
    contribution: ContactContribution,
  ): Promise<GetContributionInfoResult>;

  updateContribution(
    contribution: ContactContribution,
    paymentForm: PaymentForm,
  ): Promise<UpdateContributionResult>;

  // ... other methods
}
```

**Benefits**:

- Consistent method signatures across providers
- Better separation of concerns
- Easier testing and mocking

#### 2.2 Service Layer Refactoring

- **TODO**: Move payment logic from `ContactsService` to `PaymentService`
- **TODO**: Eliminate `forceUpdateContactContribution` method
- **TODO**: Create proper service boundaries

#### 2.3 Payment Method Enum Expansion

Add missing payment methods (as done in PR #42):

```typescript
export enum PaymentMethod {
  None = "none",
  Manual = "manual",
  StripeCard = "s_card",
  // ... existing methods
}
```

### Phase 3: Data Model Evolution (High Risk)

**Goal**: Implement the core data model improvements from PR #42

#### 3.1 Preparation

- **TODO**: Create comprehensive data migration scripts
- **TODO**: Set up blue-green deployment capability
- **TODO**: Create rollback procedures

#### 3.2 ContactContribution History Implementation

Implement the many-to-one relationship from PR #42:

```sql
-- Migration approach
ALTER TABLE contact_contribution ADD COLUMN id uuid DEFAULT uuid_generate_v4();
ALTER TABLE contact_contribution ADD COLUMN status varchar;
ALTER TABLE contact_contribution ADD COLUMN monthlyAmount integer;
ALTER TABLE contact_contribution ADD COLUMN period varchar;

-- Populate new fields from Contact table
UPDATE contact_contribution
SET
  status = 'current',
  monthlyAmount = contact.contributionMonthlyAmount,
  period = contact.contributionPeriod
FROM contact
WHERE contact.id = contact_contribution.contactId;
```

#### 3.3 Remove nextAmount Workaround

Replace the brittle `nextAmount` field with proper pending contributions:

```typescript
// Instead of nextAmount, create pending contribution
const pendingContribution = {
  contactId: contact.id,
  status: "pending",
  monthlyAmount: newAmount,
  period: newPeriod,
  method: currentContribution.method,
};
```

#### 3.4 Data Consolidation

Move all contribution-related fields from `Contact` to `ContactContribution`:

- `contributionType` → derived from `method`
- `contributionPeriod` → `ContactContribution.period`
- `contributionMonthlyAmount` → `ContactContribution.monthlyAmount`

### Phase 4: Flow Improvements (Medium Risk)

**Goal**: Address join flow and payment intent issues

#### 4.1 Generic Payment Flow System

Create reusable payment flows (inspired by PR #42's approach):

```typescript
interface PaymentFlow {
  id: string;
  type: "join" | "update_method" | "update_contribution";
  status: "pending" | "completed" | "cancelled";
  data: PaymentFlowData;
}
```

#### 4.2 Stripe PaymentIntent Migration

Replace SetupIntent with PaymentIntent for initial payments:

```typescript
// Instead of SetupIntent
const paymentIntent = await stripe.paymentIntents.create({
  amount: calculateInitialAmount(joinForm),
  currency: "eur",
  setup_future_usage: "off_session",
  // ... other parameters
});
```

#### 4.3 Provider-Aware Method Switching

Implement intelligent provider switching:

```typescript
const isSameProvider = (method1: PaymentMethod, method2: PaymentMethod) => {
  const stripeMethod = [
    PaymentMethod.StripeCard,
    PaymentMethod.StripeSEPA,
    // ... other Stripe methods
  ];
  return stripeMethod.includes(method1) && stripeMethod.includes(method2);
};
```

### Phase 5: Advanced Features (Low Priority)

**Goal**: Implement advanced payment system features

#### 5.1 Multi-Payment Method Support

- Support multiple active payment methods per user
- Automatic failover between payment methods
- Payment method preferences

#### 5.2 Advanced Proration

- More sophisticated proration calculations
- Support for mid-cycle changes
- Partial refunds and credits

#### 5.3 Payment Analytics

- Detailed payment success/failure metrics
- Churn analysis
- Revenue forecasting

## Implementation Guidelines

### Risk Mitigation Strategies

1. **Feature Flags**: Use feature flags for all major changes
2. **Gradual Rollout**: Implement changes for small user segments first
3. **Comprehensive Testing**: Require 100% test coverage for payment code
4. **Monitoring**: Monitor all payment metrics during rollouts
5. **Quick Rollback**: Ensure ability to rollback within minutes

### Migration Strategy

Based on PR #42's migration approach, but with improvements:

1. **Dual Write Phase**: Write to both old and new structures
2. **Migration Phase**: Migrate data in batches
3. **Validation Phase**: Verify data integrity
4. **Cutover Phase**: Switch to new structure
5. **Cleanup Phase**: Remove old structures

### Testing Requirements

1. **Unit Tests**: 100% coverage for all payment logic
2. **Integration Tests**: Full provider integration testing
3. **Migration Tests**: Test all migration scenarios
4. **Performance Tests**: Ensure no performance regressions
5. **Manual Tests**: Manual testing of all payment flows

### Success Metrics

1. **Reliability**: 99.9% payment success rate
2. **Performance**: <2s payment flow completion
3. **Maintainability**: Reduced code complexity metrics
4. **Developer Experience**: Faster feature development
5. **User Experience**: Reduced payment-related support tickets

## Timeline Estimate

- **Phase 1**: 2-4 weeks (Foundation)
- **Phase 2**: 4-6 weeks (Interface Improvements)
- **Phase 3**: 8-12 weeks (Data Model Evolution)
- **Phase 4**: 4-6 weeks (Flow Improvements)
- **Phase 5**: 6-8 weeks (Advanced Features)

**Total**: 6-9 months for complete transformation

## Conclusion

The payment system improvements should be implemented incrementally, learning from the scope and complexity challenges of PR #42. The key is to:

1. Start with low-risk improvements
2. Build comprehensive testing infrastructure
3. Implement changes in small, reviewable increments
4. Maintain backward compatibility during transitions
5. Monitor and validate each phase before proceeding

This approach will ensure that the payment system becomes more maintainable, reliable, and extensible while minimizing the risk of introducing bugs or payment processing issues.

## References

- **Problems Documentation**: [problems.md](./problems.md)
- **Data Model Analysis**: [data-model.md](./data-model.md)
- **Architecture Overview**: [architecture.md](./architecture.md)
- **Historical Attempt**: [PR #42](https://github.com/beabee-communityrm/monorepo/pull/42)
- **Payment Flow Issues**: [payment-flow.md](./payment-flow.md)
