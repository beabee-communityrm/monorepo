# Payment System Architecture

## Core Components

### Service Layer
- **PaymentService**: Manages ongoing payment operations
  - Contribution management
  - Payment method updates
  - Customer data handling
  
- **PaymentFlowService**: Handles payment setup flows
  - Flow creation and completion
  - Provider coordination
  - Setup validation

### Provider System
Two types of providers handle different aspects:

#### PaymentProvider
Manages ongoing payment operations:
- Payment processing
- Subscription management
- Contact updates

#### PaymentFlowProvider
Handles initial payment setup:
- Payment method setup
- User authentication
- Provider-specific flows

### Data Model

#### Core Entities
- `Contact`: Main user entity
- `ContactContribution`: Payment configuration
- `Payment`: Transaction records
- `JoinFlow`: Setup process tracking

### Integration Points
- REST API endpoints
- Webhook handlers
- Provider APIs
- Frontend components

For implementation details, see `packages/core/src/providers/payment/` 
