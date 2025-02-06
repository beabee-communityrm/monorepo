# Payment Providers

## Overview
beabee supports multiple payment providers to handle different payment methods and regions. Each provider implements standardized interfaces for consistent integration.

## Available Providers

### 1. Stripe
**Capabilities:**
- Credit/Debit Cards
- SEPA Direct Debit
- BACS Direct Debit
- PayPal
- iDEAL

**Implementation:**
- `StripeProvider`: Handles ongoing payments
- `StripeFlowProvider`: Manages setup flows
- Location: `packages/core/src/providers/payment/`

### 2. GoCardless
**Capabilities:**
- Direct Debit (various regions)
- Bank account payments

**Implementation:**
- `GCProvider`: Handles ongoing payments
- `GCFlowProvider`: Manages setup flows
- Location: `packages/core/src/providers/payment/`

### 3. Manual
**Capabilities:**
- Manual payment tracking
- Basic payment operations

**Implementation:**
- `ManualProvider`: Basic payment operations
- No flow provider needed
- Location: `packages/core/src/providers/payment/`

## Provider Capabilities

### Common Operations
1. **Contribution Management**
   - Update amounts
   - Change schedules
   - Cancel contributions

2. **Payment Method Management**
   - Update payment methods
   - Handle mandates
   - Manage authorizations

3. **Contact Management**
   - Update contact details
   - Handle contact deletion
   - Sync provider data

### Provider-Specific Features

#### Stripe Features
- Tax rate handling
- Multiple currency support
- Subscription management
- Invoice generation

#### GoCardless Features
- Direct Debit specific flows
- Mandate management
- Regional payment schemes

## Integration Points

### Service Layer Integration
- `PaymentService` coordinates provider operations
- Provider factory pattern for instantiation
- Automatic provider selection based on payment method

### Data Synchronization
- Webhook-driven updates
- Regular sync jobs
- Error recovery mechanisms

For implementation details, see the provider classes in `packages/core/src/providers/payment/`.
