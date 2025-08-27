# Payment System Documentation

## Overview

This documentation explains beabee's payment system architecture and workflows.

## Contents

### Core Documentation

1. [Architecture](./architecture.md) - System architecture, core components, and current problems
2. [Payment Flow](./payment-flow.md) - Payment setup, processing, and known issues
3. [Providers](./providers.md) - Payment provider implementations
4. [Webhooks](./webhooks.md) - Event handling and processing
5. [Data Model](./data-model.md) - Detailed analysis of payment data structures

### Problem Analysis and Solutions

6. [Problems](./problems.md) - Comprehensive documentation of current payment system issues
7. [Improvement Plan](./improvement-plan.md) - Structured approach to resolving identified problems

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

## Historical Context

The payment system has undergone several attempts at improvement:

- **[PR #42](https://github.com/beabee-communityrm/monorepo/pull/42)**: Previous comprehensive refactoring attempt (2024)
- **[Mural Documentation](https://app.mural.co/t/beabee6721/m/beabee6721/1651065526558/7e52f76fd91d54d92b1afd6650d4e203c2ab8153)**: Visual documentation of payment system complexity

These resources provide valuable context for understanding the evolution and challenges of the current system.
