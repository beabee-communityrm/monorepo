# @beabee/tsconfig

Shared TypeScript configurations for all packages in the Beabee monorepo.

## Overview

The Beabee Monorepo uses a sophisticated TypeScript configuration system to ensure proper type checking and module resolution across all packages. This package provides shared configurations that standardize TypeScript settings across the entire monorepo.

## Installation

```bash
yarn add -D @beabee/tsconfig
```

## Architecture

### Dual tsconfig Structure

Many packages in the monorepo use a dual `tsconfig` setup to optimize both development and build processes:

- **`tsconfig.json`**: Used by IDEs for optimal IntelliSense and type checking
- **`tsconfig.build.json`**: Used for the actual build process

This separation ensures development tools get access to source files while build processes use appropriate production settings.

### TypeScript References

TypeScript references establish dependencies between packages and enable:

- **Proper type resolution**: Import types from other packages correctly
- **IDE navigation**: Jump to source code across package boundaries
- **Incremental compilation**: Only rebuild changed packages

```typescript
// Example tsconfig.json with references
{
  "extends": ["./tsconfig.build.json", "@beabee/tsconfig/tsconfig.dev.json"],
  "exclude": [],
  "references": [
    { "path": "../../packages/common" },
    { "path": "../../packages/core" }
  ]
}
```

## Available Configurations

### tsconfig.server.json

Configuration for server-side TypeScript projects, particularly those using decorators.

**Features:**
- Extends `@tsconfig/node22` for Node.js compatibility
- Enables experimental decorators and decorator metadata for frameworks like `routing-controllers`
- Includes strict type checking options like `exactOptionalPropertyTypes`
- Allows importing JSON modules with `resolveJsonModule`
- Disables `useDefineForClassFields` for compatibility with class-transformer libraries

**Usage:**
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

### tsconfig.frontend.json

Configuration for frontend TypeScript projects running in the browser.

**Features:**
- Extends `@vue/tsconfig/tsconfig.dom.json` for browser DOM types
- Enables source maps for better debugging
- Uses isolated modules for faster compilation
- Preserves watch output for development experience

**Usage:**
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

### tsconfig.vanilla.json

Configuration for packages that export TypeScript files directly without a build step.

**Features:**
- Eliminates the need for `build` and `watch` scripts
- Allows direct execution of TypeScript files using Node's experimental TypeScript support
- Maintains type checking capabilities with `tsc --noEmit`
- Ideal for development tools, build scripts, and utility packages

**Usage:**
```json
{
  "extends": "@beabee/tsconfig/tsconfig.vanilla.json",
  "include": ["src/**/*.ts"],
  "compilerOptions": {
    "rootDir": "./src"
  }
}
```

Packages using this configuration can be run directly with:
```bash
node --experimental-specifier-resolution=node --experimental-strip-types --experimental-transform-types --no-warnings your-file.ts
```

### tsconfig.dev.json

Options used to enable TS composite build mode, currently included in most `tsconfig.json` files to improve type and module resolution in the IDE

## Guidelines for New Packages

When creating a new package in the monorepo, follow these guidelines:

### 1. Choose Configuration Type

**Dual configuration** (recommended for most packages):
- Package has build script and outputs to `dist/`
- Provides compiled JavaScript for consumption
- Better performance for consumers

**Single configuration** (for development tools):
- Package exports TypeScript files directly
- Simpler setup, no build step required
- Suitable for tools and utilities

### 2. Required Scripts

**For dual configuration packages:**
```json
{
  "scripts": {
    "build": "tsc -p tsconfig.build.json", 
    "check:tsc": "tsc -p tsconfig.build.json --noEmit"
  }
}
```

**For single configuration packages:**
```json
{
  "scripts": {
    "check": "tsc --noEmit"
  }
}
```

### 3. TypeScript References

Add references for each `workspace:^` dependency in your `package.json`:

```json
{
  "references": [
    { "path": "../../packages/common" },
    { "path": "../../packages/core" }
  ]
}
```

This enables proper type resolution and IDE navigation across package boundaries.

### 4. Base Configuration Selection

Choose the appropriate base configuration:

- **Server packages**: `@beabee/tsconfig/tsconfig.server.json`
- **Frontend packages**: `@beabee/tsconfig/tsconfig.frontend.json`  
- **Vanilla packages**: `@beabee/tsconfig/tsconfig.vanilla.json`

### 5. Example Package Configurations

**Dual configuration package:**
```json
// tsconfig.json
{
  "extends": ["./tsconfig.build.json", "@beabee/tsconfig/tsconfig.dev.json"],
  "exclude": [],
  "references": [
    { "path": "../../packages/common" }
  ]
}

// tsconfig.build.json
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

**Single configuration package:**
```json
// tsconfig.json
{
  "extends": "@beabee/tsconfig/tsconfig.vanilla.json",
  "include": ["src/**/*.ts"],
  "references": [
    { "path": "../../packages/common" }
  ]
}
```

## Requirements

This package requires the following peer dependencies:
- `typescript` (^5.0.0)
