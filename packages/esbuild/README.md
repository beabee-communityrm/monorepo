# @beabee/esbuild

Shared esbuild utilities and configurations for the Beabee monorepo.

## Overview

This package provides common build functions, plugins, and utilities that are used across different packages in the Beabee monorepo. It centralizes the build logic to ensure consistency and reduce code duplication.

## Features

- **Standard Build Orchestration**: Pre-configured ESM, CommonJS, and Browser builds
- **Watch Mode Support**: Built-in file watching with logging
- **Locale-specific Tools**: Special handling for internationalization files
- **Common Plugins**: Reusable esbuild plugins for various tasks
- **Utility Functions**: Helper functions for file manipulation and build processes
- **TypeScript Types**: Comprehensive type definitions for all interfaces

## Usage

### Standard Package Build

For most packages, you can use the `buildStandard` function:

```typescript
import { buildStandard } from "@beabee/esbuild";

const entryPoints = ["./src/index.ts", "./src/**/*.ts"];
await buildStandard("@beabee/my-package", entryPoints, "MyPackageGlobal");
```

This will automatically:
- Build ESM modules to `./dist/esm`
- Build CommonJS modules to `./dist/cjs` 
- Build browser bundle to `./dist/browser`
- Support watch mode when `--watch` is passed
- Handle file renaming for CommonJS

### Custom Builds

For more control, use the individual build functions:

```typescript
import { buildESM, buildCJS, buildBrowser } from "@beabee/esbuild";
import type { BuildOptions } from "@beabee/esbuild/types";

const esm = await buildESM({
  entryPoints: ["./src/index.ts"],
  outdir: "./dist/esm",
  watch: false,
});

const cjs = await buildCJS({
  entryPoints: ["./src/index.ts"],
  outdir: "./dist/cjs", 
  watch: false,
});

const browser = await buildBrowser({
  entryPoints: ["./src/index.ts"],
  outdir: "./dist/browser",
  globalName: "MyLibrary",
  watch: false,
});
```

### Locale-specific Builds

For packages that handle internationalization:

```typescript
import { 
  normalizeTranslations, 
  generateTemplate,
  createCopyPlugin 
} from "@beabee/esbuild";
import type { CopyPluginOptions } from "@beabee/esbuild/types";

// Normalize translation files
await normalizeTranslations("./src/locales");

// Generate template from English locale
await generateTemplate("./src/locales", "./src/template.json");

// Use copy plugin for locale files
const copyPlugin = createCopyPlugin({
  sourceDir: "./src/locales",
  outdir: "./dist",
  dirName: "locales",
  isWatch: false
});
```

### Type Imports

All TypeScript types are available from the types export:

```typescript
import type { 
  BuildOptions, 
  LocalePluginOptions, 
  CopyPluginOptions 
} from "@beabee/esbuild/types";
```

## API Reference

### Build Functions

#### `buildStandard(packageName, entryPoints, globalName, additionalPlugins?)`

Standard build orchestration for packages with ESM, CJS, and Browser builds.

- `packageName`: Name of the package for logging
- `entryPoints`: Array of entry point files
- `globalName`: Global variable name for browser IIFE build
- `additionalPlugins`: Optional additional esbuild plugins

#### `buildESM(options)`, `buildCJS(options)`, `buildBrowser(options)`

Individual build functions for specific formats.

**Options:** See `BuildOptions` type for all available options.

### Plugins

#### `createWatchLoggerPlugin(name)`

Creates a plugin that logs build completion and errors during watch mode.

#### `createCjsRenamePlugin(outdir)`

Creates a plugin that renames .js files to .cjs after CJS build completion.

### Locale Tools

#### `normalizeTranslations(localesDir)`

Ensures all translation files have the same structure as the English locale file.

#### `generateTemplate(localesDir, templatePath)`

Generates a template file from the English locale with empty string values.

#### `applyFallbackTranslations(configPath, localesDir)`

Applies fallback translations based on configuration.

#### `localePlugin(options)`

esbuild plugin for processing locale files with fallback translations.

**Options:** See `LocalePluginOptions` type.

#### `createCopyPlugin(options)`

Plugin for copying locale files with watch support.

**Options:** See `CopyPluginOptions` type.

### Utilities

#### `renameExtensions(directory)`

Recursively renames .js files to .cjs in a directory.

#### `isWatchMode()`

Checks if the current process is running in watch mode.

#### `getTimestamp()`

Returns current timestamp for logging.

### Types

All TypeScript interfaces and types are available from `@beabee/esbuild/types`:

- `BuildOptions` - Configuration options for build functions
- `LocalePluginOptions` - Configuration options for locale plugin
- `CopyPluginOptions` - Configuration options for copy plugin

## Package Structure

```
packages/esbuild/
├── src/
│   ├── builders.ts          # Build functions
│   ├── plugins.ts           # esbuild plugins
│   ├── utils.ts             # Utility functions
│   ├── types/               # TypeScript type definitions
│   │   ├── build-options.ts
│   │   ├── locale-plugin-options.ts
│   │   ├── copy-plugin-options.ts
│   │   └── index.ts
│   └── locale/              # Locale-specific tools
│       ├── utils.ts
│       ├── fallback-translations.ts
│       ├── esbuild-locale-plugin.ts
│       ├── generate-template.ts
│       ├── normalize-translations.ts
│       ├── copy-plugin.ts
│       └── index.ts
├── index.ts                 # Main export
├── package.json
└── README.md
```

## Examples

See the following packages for real-world usage examples:

- `packages/common/esbuild.ts` - Standard package build
- `packages/client/esbuild.ts` - Standard package with watch mode
- `packages/locale/esbuild.ts` - Locale-specific build with JSON processing

## Dependencies

- `esbuild` - Core build tool
- `@gjsify/esbuild-plugin-transform-ext` - File extension transformation
