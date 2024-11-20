# @beabee/tsconfig

Shared TypeScript configurations for all packages in the monorepo.

## Usage

```bash
yarn add -D @beabee/tsconfig
```

Available configurations:

- `tsconfig.server.json`: Base configuration for server TypeScript projects
- `tsconfig.frontend.json`: Configuration for frontend TypeScript projects
- `tsconfig.options.json`: Configuration for general TypeScript options

Example usage in `tsconfig.json`:

```json
{
  "extends": "@beabee/tsconfig/frontend.json",
  "compilerOptions": {
    // Additional project-specific options
  }
}
```

## Requirements

This package has the following peer dependencies:
- `typescript` (^5.0.0)
