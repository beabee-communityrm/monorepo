# Environment Variables Guide

## Overview

This guide explains how to work with environment variables in the Beabee project. It focuses on workflows, setup procedures, and troubleshooting.

## Documentation Structure

Environment variable documentation is organized by location and purpose:

### Primary Documentation (TypeScript Files)
- **Backend Variables**: `packages/core/src/config/config.ts` - Comprehensive JSDoc comments with types, defaults, and validation
- **Frontend Variables**: `apps/frontend/src/env.ts` - Frontend-specific variables with detailed documentation
- **Test Variables**: `packages/test-utils/vitest/env.ts` - Test environment configuration

### Quick Reference (Example Files)
- **`.env.example`** - Simplified overview with required/optional indicators
- **`.env.test.example`** - Test environment overrides
- **`.env.remote.example`** - Remote CLI configuration

### This Guide
Focuses on workflows, setup procedures, and best practices.

When adding or updating environment variables:
1. Update the relevant TypeScript file with full documentation
2. Update the corresponding `.env.example` file with a brief description
3. Update this guide only if workflows change

## Environment Files

The project uses three main environment files, each serving a specific purpose:

| File          | Purpose                          | Git Status   | Example File          |
| ------------- | -------------------------------- | ------------ | --------------------- |
| `.env`        | Main development environment     | `.gitignore` | `.env.example`        |
| `.env.remote` | Backend CLI remote server access | `.gitignore` | `.env.remote.example` |
| `.env.test`   | Local testing environment        | `.gitignore` | `.env.test.example`   |

All environment files are excluded from version control (`.gitignore`) to prevent sensitive data from being committed. Instead, example files with the `.example` suffix are checked into the repository.

## Initial Setup

### Bootstrapping Environment Files

Run the bootstrap script to copy example files to their active counterparts:

```bash
yarn bootstrap
```

This command copies:
- `.env.example` → `.env`
- `.env.remote.example` → `.env.remote`
- `.env.test.example` → `.env.test`

### Required Configuration

After bootstrapping, you must configure the following variables in your `.env` file:

```bash
BEABEE_STRIPE_PUBLICKEY=pk_test_...
BEABEE_STRIPE_SECRETKEY=sk_test_...
BEABEE_STRIPE_WEBHOOKSECRET=whsec_...
BEABEE_STRIPE_MEMBERSHIPPRODUCTID=prod_...
```

> ⚠️ **Important**: Use test keys for development, never production keys in local environment.

## Environment File Details

### `.env` - Main Development Environment

**Purpose**: Primary configuration for local development with Docker Compose.

**Key Features**:
- Core application settings
- Database configuration
- Payment provider credentials
- Email and newsletter settings
- File storage configuration
- Frontend development settings

**Usage**: Automatically loaded by Docker Compose and development tools.

**Port Configuration**:
```bash
# Development Ports
VITE_DEV_SERVER_PORT=3000    # Frontend dev server
ROUTER_PORT=3002             # Docker router
MAIL_PORT=3025              # MailDev email testing
DB_PORT=6543                # PostgreSQL database
```

**Access Points**:
- Frontend (Vite): http://localhost:3000 (uses BEABEE_AUDIENCE for API proxy)
- Router (Docker): http://localhost:3002 (configured via BEABEE_AUDIENCE)
- MailDev: http://localhost:3025

### `.env.remote` - Backend CLI Remote Access

**Purpose**: Enables running the backend CLI locally while connecting to a remote server.

**Key Features**:
- Remote database connection
- Minimal configuration override
- CLI-specific settings

**Usage**:
```bash
# Run CLI commands against remote server
yarn backend-cli [command]
```

**Configuration Example**:
```bash
# Connect to remote production database
BEABEE_DATABASE_URL=postgres://user:pass@your-server.com:5432/beabee_production
BEABEE_SECRET=your_remote_secret_key
BEABEE_AUDIENCE=https://your-beabee-instance.com
```

**Environment Loading Order** (when CLI runs outside Docker):
1. `.env.remote` (highest priority)
2. `.env` (root environment file)
3. `.env.test` (if NODE_ENV=test)

### `.env.test` - Testing Environment

**Purpose**: Configuration for local test execution and test environment setup.

**Key Features**:
- Test-specific ports to avoid conflicts
- Test user credentials
- Simplified provider configuration
- Docker Compose test overrides

**Usage**: Automatically loaded during test execution:
```bash
yarn test
```

**Test Ports**:
```bash
# Test Environment Ports
VITE_DEV_SERVER_PORT=4000    # Frontend test server
ROUTER_PORT=4002             # Test router
MAIL_PORT=4025              # Test email server
DB_PORT=5432                # Test database (container port)
```

**Test User Configuration**:
```bash
# Primary test user for API testing
TEST_USER_EMAIL=test@beabee.io
TEST_USER_FIRSTNAME=Test
TEST_USER_LASTNAME=Test
TEST_USER_PASSWORD=test1234
TEST_USER_ROLE=superadmin

# Rate limiting test user
TEST_RATE_LIMIT_USER_EMAIL=rate-limit-test@beabee.io
# ... additional test user configuration
```

## Environment Variable Reference

### Primary Documentation Sources

Environment variables are comprehensively documented in the TypeScript source files:

1. **Backend Variables**: [`packages/core/src/config/config.ts`](../packages/core/src/config/config.ts)
   - Complete JSDoc documentation for each variable
   - Type definitions and validation rules
   - Default values and allowed options

2. **Frontend Variables**: [`apps/frontend/src/env.ts`](../apps/frontend/src/env.ts)
   - Frontend-specific environment variables
   - Usage examples and legacy fallbacks
   - Integration with build tools

3. **Test Variables**: [`packages/test-utils/vitest/env.ts`](../packages/test-utils/vitest/env.ts)
   - Test user configuration
   - API key setup
   - Test environment specifics

### Quick Reference Files

For a simplified overview, see the example files:

1. **[`.env.example`](../.env.example)** - Main development environment
2. **[`.env.test.example`](../.env.test.example)** - Test environment overrides
3. **[`.env.remote.example`](../.env.remote.example)** - Remote CLI configuration

### Variable Categories

Environment variables are organized into these main categories:

- **Core Application** - Secrets, authentication, logging
- **Network & Ports** - Service endpoints and port configuration
- **Security** - CORS, cookies, password policies
- **Localization** - Language and currency settings
- **Third-Party Services** - API keys and integration settings
- **Email & Newsletter** - Communication providers
- **Payment Processing** - Stripe and GoCardless configuration
- **Database** - Connection strings
- **File Storage** - MinIO/S3 settings
- **Image Processing** - Optimization and format settings
- **Frontend** - Client-side specific variables
- **Feature Flags** - Experimental features and modes

## Development Workflows

### Local Development Setup

1. **Bootstrap environment files**:
   ```bash
   yarn bootstrap
   ```

2. **Configure payment credentials** in `.env`:
   ```bash
   BEABEE_STRIPE_PUBLICKEY=pk_test_...
   BEABEE_STRIPE_SECRETKEY=sk_test_...
   # ... other required variables
   ```

3. **Start development stack**:
   ```bash
   docker compose up -d
   yarn dev
   ```

### Remote Server Management

1. **Configure remote access** in `.env.remote`:
   ```bash
   BEABEE_DATABASE_URL=postgres://user:pass@remote-host:5432/beabee
   BEABEE_AUDIENCE=https://your-instance.com
   BEABEE_SECRET=your_remote_secret
   ```

2. **Run CLI commands**:
   ```bash
   yarn backend-cli user list
   yarn backend-cli payment create --email user@example.com
   ```

### Testing

1. **Environment automatically configured** via `.env.test`
2. **Run tests**:
   ```bash
   yarn test
   ```
3. **Test users and API keys created automatically**

## Security Considerations

### Sensitive Data

Never commit the following to version control:
- API keys and secrets
- Database credentials
- Webhook secrets
- Production URLs

### Environment Separation

- Use `.env.example` files as templates
- Keep production secrets separate from development
- Use test credentials for development
- Validate environment variables on startup

### Access Control

- Limit access to production environment files
- Use environment-specific service accounts
- Rotate secrets regularly
- Monitor for leaked credentials

## Troubleshooting

### Common Issues

1. **Missing environment variables**: Check that all required variables are set and not empty
2. **Port conflicts**: Ensure configured ports are available
3. **Database connection**: Verify database URL format and credentials
4. **Payment provider errors**: Confirm API keys and webhook secrets are correct

### Validation

The application validates environment variables on startup. Check logs for specific validation errors:

```bash
# Check backend logs
docker compose logs api_app

# Check specific validation errors
yarn backend-cli user list  # Tests database connection
```

### Environment Loading

Debug environment loading issues:

```bash
# Check which environment files are loaded
echo $NODE_ENV

# Verify specific variables
docker compose exec api_app env | grep BEABEE_
```

## Best Practices

### Development

- Use consistent naming conventions
- Document new environment variables
- Provide sensible defaults where possible
- Validate environment variables early in application startup

### Production

- Use environment-specific secrets management
- Implement proper secret rotation
- Monitor environment variable usage
- Keep environment documentation updated

### Team Collaboration

- Keep `.env.example` files updated
- Document required vs. optional variables
- Provide setup instructions for new team members
- Use clear variable names and descriptions 
