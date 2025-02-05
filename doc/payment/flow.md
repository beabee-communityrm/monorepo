# Payment Flow Documentation

## Overview

The payment flow in beabee is managed by the `PaymentFlowService` which coordinates between different payment providers and handles the setup of new payment methods.

## Flow Architecture

### 1. PaymentFlowService

Located in `packages/core/src/services/PaymentFlowService.ts`, orchestrates:
- Payment flow creation and completion
- Join flow management
- Email confirmation handling

~~~typescript
class PaymentFlowService implements PaymentFlowProvider {
  async createJoinFlow(form: Pick<JoinForm, "email" | "password">, urls: CompleteUrls): Promise<JoinFlow>;
  async createPaymentJoinFlow(joinForm: JoinForm, urls: CompleteUrls, completeUrl: string, user: UserData): Promise<PaymentFlowParams>;
  async completeJoinFlow(joinFlow: JoinFlow): Promise<CompletedPaymentFlow | undefined>;
}
~~~

### 2. Payment Flow Providers

Each payment method has its own flow provider implementation:

- **StripeFlowProvider**: Setup flows for all Stripe methods
- **GCFlowProvider**: Direct debit setup via GoCardless
- No flow provider needed for manual payments

## Payment Flow Steps

### 1. Initiation

1. User initiates payment setup (new contribution or payment method update)
2. Frontend calls appropriate API endpoint
3. Backend creates `JoinFlow` record
4. Payment provider setup is initiated
5. Setup parameters returned to frontend

### 2. Provider Setup

#### Stripe Flow:
1. Create SetupIntent
2. Return client secret
3. Frontend uses Stripe Elements
4. User enters payment details
5. Stripe confirms setup

#### GoCardless Flow:
1. Create redirect flow
2. Return redirect URL
3. User redirected to GoCardless
4. User enters bank details
5. GoCardless redirects back

### 3. Completion

1. Provider redirects to completion URL
2. Frontend calls completion endpoint
3. Backend verifies and completes flow
4. Payment method attached to contact
5. Contribution updated if needed

## Webhook Integration

Payment providers send webhooks to update payment status:

1. **Stripe Webhooks**:
- Payment status updates
- Subscription changes
- Customer updates

2. **GoCardless Webhooks**:
- Payment confirmations
- Mandate updates
- Subscription cancellations

## Frontend Components

Key frontend pages handling payment flows:

1. **Contribution Setup**:
- Payment method selection
- Amount configuration
- Period selection

2. **Completion Handling**:
~~~vue
<!-- /profile/contribution/payment-method/complete -->
<script setup>
onBeforeMount(async () => {
  const paymentFlowId = route.query.setup_intent?.toString();
  if (paymentFlowId) {
    await completeUpdatePaymentMethod(paymentFlowId);
    router.replace('/profile/contribution');
  }
});
</script>
~~~

## API Endpoints

### Payment Flow Endpoints:

1. **Start Flow**:
~~~typescript
@Put("/:id/payment-method")
async updatePaymentMethod(
  @TargetUser() target: Contact,
  @Body() data: StartJoinFlowDto
): Promise<GetPaymentFlowDto>

@Post("/:id/contribution")
async startContribution(
  @TargetUser() target: Contact,
  @Body() data: StartContributionDto
): Promise<GetPaymentFlowDto>
~~~

2. **Complete Flow**:
~~~typescript
@Post("/:id/payment-method/complete")
async completeUpdatePaymentMethod(
  @TargetUser() target: Contact,
  @Body() data: CompleteJoinFlowDto
): Promise<GetContributionInfoDto>
~~~

## Security Considerations

1. **Authentication**:
- All payment operations require authorization
- Webhook endpoints verify signatures

2. **Data Handling**:
- Sensitive payment data handled by providers
- Only payment tokens stored locally

3. **Flow Validation**:
- Payment flow IDs verified
- User authorization checked
- Flow state validated

## Error Handling

1. **Common Errors**:
- Invalid payment setup
- Unauthorized access
- Failed provider setup

2. **Recovery Flows**:
- Automatic retries for webhooks
- Manual intervention options
- User feedback and guidance

## Related Documentation

- [Stripe Integration](./stripe.md)
- [Payment Providers](./providers.md)
