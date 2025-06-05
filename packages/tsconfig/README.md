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
- `tsconfig.vanilla.json`: Configuration for packages that export TypeScript files directly without a build step

Example usage in `tsconfig.json`:

```json
{
  "extends": "@beabee/tsconfig/tsconfig.frontend.json",
  "compilerOptions": {
    // Additional project-specific options
  }
}
```

### Using tsconfig.server.json

The `tsconfig.server.json` configuration is designed for server-side TypeScript projects, particularly those using decorators. This configuration:

- Extends `@tsconfig/node22` for Node.js compatibility
- Enables experimental decorators and decorator metadata for frameworks like NestJS
- Includes strict type checking options like `exactOptionalPropertyTypes`
- Allows importing JSON modules with `resolveJsonModule`
- Disables `useDefineForClassFields` for compatibility with class-transformer libraries

Example usage in server packages:

```json
{
  "extends": "@beabee/tsconfig/tsconfig.server.json",
  "include": ["./src/**/*"],
  "exclude": ["./**/*.test.ts"],
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist"
  }
}
```

### Using tsconfig.frontend.json

The `tsconfig.frontend.json` configuration is designed for frontend TypeScript projects running in the Browser. This configuration:

- Extends `@vue/tsconfig/tsconfig.dom.json` for browser DOM types
- Enables source maps for better debugging
- Uses isolated modules for faster compilation
- Preserves watch output for development experience

Example usage in frontend packages:

```json
{
  "extends": "@beabee/tsconfig/tsconfig.frontend.json",
  "include": [
    "src/**/*.ts",
    "src/**/*.vue",
    "env.d.ts"
  ],
  "exclude": ["node_modules", "dist"]
}
```

### Using tsconfig.vanilla.json

The `tsconfig.vanilla.json` configuration is designed for packages that export TypeScript files directly, without requiring a build step. This approach simplifies the development workflow by:

- Eliminating the need for `build` and `watch` scripts
- Allowing direct execution of TypeScript files using Node's experimental TypeScript support
- Maintaining type checking capabilities with `tsc --noEmit`

This configuration is ideal for development tools, build scripts, and utility packages that are executed directly. Packages using this configuration can be run with:

```bash
node --experimental-specifier-resolution=node --experimental-strip-types your-file.ts
```

Example `package.json` scripts for vanilla packages:

```json
{
  "scripts": {
    "check": "tsc --noEmit --project tsconfig.json",
    "format": "prettier --write ."
  }
}
```

## Requirements

This package has the following peer dependencies:
- `typescript` (^5.0.0)
