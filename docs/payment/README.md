# Payment System Documentation

## Overview
This documentation explains beabee's payment system architecture and workflows.

## Contents
1. [Architecture](./architecture.md) - System architecture and core components
2. [Payment Flow](./payment-flow.md) - Payment setup and processing
3. [Providers](./providers.md) - Payment provider implementations
4. [Webhooks](./webhooks.md) - Event handling and processing

## Quick Links
- Implementation: `packages/core/src/providers/payment/`
- Webhook handlers: `apps/webhooks/src/handlers/`
- Services: `packages/core/src/services/`

## Development Setup
1. Configure provider credentials in environment
2. Set up webhook endpoints
3. Enable required feature flags
4. Configure webhook secrets

For detailed setup, see [Backend README](../../apps/backend/README.md) 
