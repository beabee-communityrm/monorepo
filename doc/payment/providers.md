# Payment Providers Documentation

## Overview

The payment system in beabee uses two distinct provider types:

1. **PaymentProvider**: Handles ongoing payment operations
2. **PaymentFlowProvider**: Manages the initial payment setup flow

## Provider Structure

### Base Provider Classes

1. **PaymentProvider** (`payment/PaymentProvider.ts`):
~~~typescript
abstract class PaymentProvider {
  abstract canChangeContribution(useExistingMandate: boolean, paymentForm: PaymentForm): Promise<boolean>;
  abstract cancelContribution(keepMandate: boolean): Promise<void>;
  abstract getContributionInfo(): Promise<Partial<ContributionInfo>>;
  abstract updateContact(updates: Partial<Contact>): Promise<void>;
  abstract updateContribution(paymentForm: PaymentForm): Promise<UpdateContributionResult>;
  abstract updatePaymentMethod(completedPaymentFlow: CompletedPaymentFlow): Promise<void>;
  abstract permanentlyDeleteContact(): Promise<void>;
}
~~~

2. **PaymentFlowProvider** (`payment-flow/PaymentFlowProvider.ts`):
~~~typescript
abstract class PaymentFlowProvider {
  abstract createPaymentFlow(joinFlow: JoinFlow, completeUrl: string, data: PaymentFlowData): Promise<PaymentFlow>;
  abstract completePaymentFlow(joinFlow: JoinFlow): Promise<CompletedPaymentFlow>;
  abstract getCompletedPaymentFlowData(completedPaymentFlow: CompletedPaymentFlow): Promise<CompletedPaymentFlowData>;
}
~~~

### Available Providers

1. **Stripe**
   - `StripeProvider`: Handles payment operations
   - `StripeFlowProvider`: Manages payment setup flows
   - Supports: Card, SEPA, BACS, PayPal, iDEAL

2. **GoCardless**
   - `GCProvider`: Handles payment operations
   - `GCFlowProvider`: Manages direct debit setup flows

3. **Manual**
   - `ManualProvider`: Basic payment operations
   - No flow provider needed

## Integration in PaymentService

The `PaymentService` acts as a factory and coordinator for payment providers:

~~~typescript
const PaymentProviders = {
  [PaymentMethod.StripeCard]: StripeProvider,
  [PaymentMethod.StripeSEPA]: StripeProvider,
  [PaymentMethod.StripeBACS]: StripeProvider,
  [PaymentMethod.StripePayPal]: StripeProvider,
  [PaymentMethod.StripeIdeal]: StripeProvider,
  [PaymentMethod.GoCardlessDirectDebit]: GCProvider
};
~~~

The service:
- Creates appropriate provider instances
- Manages contribution data
- Coordinates payment operations
- Handles provider-specific logic

## API Integration

### PaymentController

The payment system is exposed through a REST API:

~~~typescript
@JsonController("/payment")
@Authorized()
export class PaymentController {
  @Get("/")
  async getPayments(...): Promise<PaginatedDto<GetPaymentDto>>
  
  @Get("/:id")
  async getPayment(...): Promise<GetPaymentDto | undefined>
}
~~~

### Data Transformation

The `PaymentTransformer` handles:
- Converting payment data for API responses
- Filtering payments based on authorization
- Loading related data (e.g., contacts)
- Implementing pagination

## Provider Capabilities

Each provider implements these key capabilities:

1. **Contribution Management**
   - Check if contribution changes are allowed
   - Update contribution amounts and schedules
   - Cancel contributions

2. **Payment Method Management**
   - Update payment methods
   - Handle payment source information
   - Manage mandates/authorizations

3. **Contact Management**
   - Update contact information with payment provider
   - Handle contact deletion
   - Sync contact data

4. **Information Retrieval**
   - Get contribution status
   - Fetch payment source details
   - Check pending payments

## Usage Example

~~~typescript
// Get payment provider for a contact
const provider = PaymentService.getProvider(contact);

// Update contribution
await provider.updateContribution({
  monthlyAmount: 10,
  period: "monthly",
  payFee: true
});

// Cancel contribution
await provider.cancelContribution(false);
~~~

## Data Model

The payment system uses these key entities:

1. **ContactContribution**
   - Stores contribution data
   - Links contacts to payment methods
   - Tracks subscription status

2. **Payment**
   - Records individual payments
   - Tracks payment status
   - Links to contacts

## Security Considerations

- All payment operations require authorization
- Non-admin users can only access their own payments
- Sensitive payment data is stored with payment providers
- Provider operations are logged for auditing
