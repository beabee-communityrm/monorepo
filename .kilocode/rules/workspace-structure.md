# Workspace Structure

Information about the node / npm / yarn packages / modules in this workspace.

**Beabee Monorepo Package Structure:**

**Yarn Workspaces:** Packages in `packages/` (importable) and `apps/` (standalone applications).

**Importable Packages (`packages/`):**
- `@beabee/client` - API client for backend communication
- `@beabee/beabee-common` - Shared types and utilities across projects
- `@beabee/core` - Backend core with models, services, providers
- `@beabee/vue` - Vue components library for frontend
- `@beabee/locale` - Internationalization and translations
- `@beabee/fontawesome` - Complete FontAwesome integration with search, filtering, and icon picker functionality
- `@beabee/prettier-config` - Code formatting configuration
- `@beabee/tsconfig` - TypeScript configurations (frontend, server, vanilla)
- `@beabee/test-utils` - Testing utilities and helpers
- `@beabee/esbuild` - Build configuration and plugins
- `@beabee/docker` - Docker base configuration
- `@beabee/template-vanilla` - TypeScript package template
- `@beabee/weblate-client` - Translation management API client

**Applications (`apps/`):**
- `@beabee/backend` - Main API server (community engagement system)
- `@beabee/frontend` - Modern Vue 3 frontend with form builder
- `@beabee/webhooks` - External service integrations (Stripe, GoCardless)
- `@beabee/backend-cli` - Admin CLI (setup, migrations, data management)
- `@beabee/legacy` - Legacy frontend (being phased out)
- `@beabee/e2e-api-tests` - API test suite
- `@beabee/dev-cli` - Development tools (index generation, building)
- `@beabee/router` - Nginx routing configuration
- `@beabee/minio` - Object storage configuration

**Import Rule:** Only packages from `packages/` can be imported. Use package names for cross-package imports. Apps cannot be imported by other packages.
