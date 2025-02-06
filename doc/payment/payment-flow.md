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

For implementation details, see `packages/core/src/services/PaymentFlowService.ts`
