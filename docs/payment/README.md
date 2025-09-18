# Payment System Documentation

This documentation explains beabee's payment system architecture, current problems, and improvement strategies.

## Contents

1. [Architecture](./architecture.md) - System components and integration points
2. [Data Model](./data-model.md) - Current data structures, problems, and solutions
3. [Payment Flow](./payment-flow.md) - Payment setup and processing workflows
4. [Providers](./providers.md) - Payment provider implementations
5. [Webhooks](./webhooks.md) - Event handling and processing
6. [Problems](./problems.md) - Current system issues and impact analysis
7. [Improvement Plan](./improvement-plan.md) - Structured approach to system improvements

## Quick Start

**Implementation**: `packages/core/src/providers/payment/`  
**Services**: `packages/core/src/services/PaymentService.ts`, `ContactsService.ts`  
**Models**: `packages/core/src/models/Contact*.ts`

**Setup**: Configure provider credentials, webhook endpoints, and secrets. See [Backend README](../../apps/backend/README.md).

## Historical Context

- **[PR #42](https://github.com/beabee-communityrm/monorepo/pull/42)**: Previous refactoring attempt (2024)
- **[Mural Board](https://app.mural.co/t/beabee6721/m/beabee6721/1651065526558/7e52f76fd91d54d92b1afd6650d4e203c2ab8153)**: Visual system complexity documentation
