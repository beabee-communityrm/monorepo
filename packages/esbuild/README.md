# @beabee/esbuild

Shared esbuild utilities and configurations for the Beabee monorepo.

## Features

- Pre-configured ESM Node builds (flat `dist/`)
- Watch mode support with logging
- Locale-specific build tools
- Common esbuild plugins
- TypeScript support

## Usage

### Node ESM Build

```typescript
import { buildESM } from '@beabee/esbuild';

await buildESM({
  entryPoints: ['./src/index.ts', './src/**/*.ts'],
  outdir: './dist',
});
```

Most packages invoke this indirectly via the `dev-cli esbuild` command:

```jsonc
// package.json
"build:esbuild": "yarn workspace @beabee/dev-cli start esbuild --baseDir $(pwd)"
```

### Locale Tools

For internationalization:

```typescript
import { generateTemplate, normalizeTranslations } from '@beabee/esbuild';

// Normalize translation files
await normalizeTranslations('./src/locales');

// Generate template from English locale
await generateTemplate('./src/locales', './src/template.json');
```

## API Reference

### Main Functions

- `buildESM(options)` - Build ESM modules

### Locale Functions

- `normalizeTranslations(localesDir)` - Same keys as en.json, missing keys filled with `""`, key order alphabetical
- `generateTemplate(localesDir, templatePath)` - Empty-string template from en.json, keys sorted alphabetically
- `generateFallbackTranslations(config, localesDir, outputDir)` - Writes locale files with fallbacks applied; output keys sorted alphabetically

### Types

Import types from `@beabee/esbuild/types`:

- `BuildOptions`
- `CopyPluginOptions`

## Examples

Check the actual usage in:

- `packages/beabee-common/package.json` - Standard package build
- `packages/client/package.json` - Build with watch mode
- `packages/locale/esbuild.ts` - Locale-specific build (custom orchestration)
