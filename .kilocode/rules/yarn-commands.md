# Yarn Commands

Information about how the code structure can be validated, tested and built.

**Beabee Monorepo Yarn Commands:**

**Development Workflow:**
- `yarn build` - Build all packages (respects dependency order)
- `yarn dev` - Start development mode with hot reloading for all packages
- `yarn check` - Type checking + linting across all workspaces (parallel)
- `yarn test` - Run all test suites
- `yarn format` - Format code across all packages

**Package-Specific Commands:**
- `yarn workspace @beabee/[package-name] run [script]` - Run script on specific package
- `yarn workspace @beabee/frontend run check` - Example: Check frontend package
- `yarn workspace @beabee/backend run typeorm` - Example: Run TypeORM commands

**Setup & Maintenance:**
- `yarn bootstrap` - Copy environment files + run bootstrap scripts
- `yarn setup` - Initialize backend (admin user, payment setup)
- `yarn clear` - Clean build artifacts
- `yarn generate:index` - Generate index files for packages

**Publishing:**
- `yarn publish:latest` - Publish packages to NPM (latest tag)
- `yarn publish:next` - Publish packages to NPM (next tag)

**Verification Commands:**
Always run these after changes:
1. `yarn check` - Verify types and linting
2. `yarn build` - Ensure everything builds
3. `yarn test` - Run tests

**Key Notes:**
- Use workspace syntax for package-specific operations
- Global commands run across all packages in parallel
- Build follows topological order (dependencies first)
