# @beabee/esbuild

Shared esbuild utilities and configurations for the Beabee monorepo.

## Features

- Pre-configured ESM and CommonJS builds
- Watch mode support with logging
- Locale-specific build tools
- Common esbuild plugins
- TypeScript support

## Usage

### Standard Build

Most packages use the `buildStandard` function:

```typescript
import { buildStandard } from '@beabee/esbuild';

await buildStandard({
  entryPoints: ['./src/index.ts', './src/**/*.ts'],
  watch: false,
});
```

This builds both ESM (`./dist/esm`) and CommonJS (`./dist/cjs`) formats.

### Custom Builds

For individual formats:

```typescript
import { buildBrowser, buildCJS, buildESM } from '@beabee/esbuild';

// ESM only
await buildESM({
  entryPoints: ['./src/index.ts'],
  outdir: './dist/esm',
});

// Browser bundle
await buildBrowser({
  entryPoints: ['./src/index.ts'],
  outdir: './dist/browser',
  globalName: 'MyLibrary',
});
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

- `buildStandard(options)` - Builds both ESM and CommonJS
- `buildESM(options)` - Builds ESM modules only
- `buildCJS(options)` - Builds CommonJS modules only
- `buildBrowser(options)` - Builds browser bundles

### Locale Functions

- `normalizeTranslations(localesDir)` - Same keys as en.json, missing keys filled with `""`, key order alphabetical
- `generateTemplate(localesDir, templatePath)` - Empty-string template from en.json, keys sorted alphabetically
- `generateFallbackTranslations(config, localesDir, outputDir)` - Writes locale files with fallbacks applied; output keys sorted alphabetically

### Types

Import types from `@beabee/esbuild/types`:

- `BuildStandardOptions`, `BuildOptions`, `BuildIIFEOptions`
- `CopyPluginOptions`

## Examples

Check the actual usage in:

- `packages/common/package.json` - Standard package build
- `packages/client/package.json` - Build with watch mode
- `packages/locale/esbuild.ts` - Locale-specific build
