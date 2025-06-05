# @beabee/dev-cli

Development CLI for Beabee monorepo - provides common development tasks and utilities.

## Installation

The CLI is available as a workspace package. From anywhere in the monorepo:

```bash
# Short form (recommended)
yarn dev-cli <command>

# Full workspace command
yarn workspace @beabee/dev-cli start <command>
```

## Commands

### `generate-index`

Automatically generates index.ts files that export all TypeScript files in specified directories.

```bash
yarn dev-cli generate-index -p <directories...>
```

**Options:**

- `-p, --paths` (required): Directories where index files should be generated
- `--ext, --extension`: File extension for imports (`js`, `ts`, `none`). Default: `js`
- `-b, --baseDir`: Base directory to resolve paths from. Default: current directory

**Examples:**

```bash
# Generate index files for multiple directories
yarn dev-cli generate-index -p ./src/types ./src/utils ./src/api

# Use TypeScript extensions in imports
yarn dev-cli generate-index -p ./src/components --ext ts

# Generate for packages from monorepo root
yarn dev-cli generate-index -p packages/common/src/types packages/common/src/utils

# Specify base directory
yarn dev-cli generate-index -p ./src/types ./src/api --baseDir packages/client
```

### `esbuild`

Build packages using the shared esbuild configuration.

```bash
yarn dev-cli esbuild --pkg <package-name> --global <global-name>
```

**Options:**

- `--pkg, --packageName` (required): Package name for the build (e.g., `@beabee/common`)
- `--global, --globalName` (required): Global name for browser builds (e.g., `BeabeeCommon`)
- `--entry, --entryPoints`: Entry points for build. Default: `["./src/index.ts", "./src/**/*.ts"]`
- `-w, --watch`: Enable watch mode for continuous rebuilding. Default: `false`
- `-b, --baseDir`: Base directory to resolve paths from. Default: current directory

**Examples:**

```bash
# Build a package
yarn dev-cli esbuild --pkg @beabee/common --global BeabeeCommon

# Build with watch mode
yarn dev-cli esbuild --pkg @beabee/client --global BeabeeClient --watch

# Build from specific directory
yarn dev-cli esbuild --pkg @beabee/vue --global BeabeeVue --baseDir packages/vue

# Custom entry points
yarn dev-cli esbuild --pkg @beabee/utils --global BeabeeUtils --entry ./src/main.ts ./src/helpers/**/*.ts
```

## Common Use Cases

### Regenerating All Index Files

```bash
# Client package
yarn dev-cli generate-index -p packages/client/src/types packages/client/src/api packages/client/src/utils

# Common package
yarn dev-cli generate-index -p packages/common/src/data packages/common/src/error packages/common/src/search packages/common/src/types packages/common/src/utils packages/common/src/validators

# Backend API
yarn dev-cli generate-index -p apps/backend/src/api/controllers apps/backend/src/api/decorators apps/backend/src/api/dto apps/backend/src/api/interceptors apps/backend/src/api/middlewares apps/backend/src/api/params apps/backend/src/api/transformers apps/backend/src/api/utils apps/backend/src/api/validators apps/backend/src/type
```

### Building Packages

```bash
# Build all main packages
yarn dev-cli esbuild --pkg @beabee/common --global BeabeeCommon --baseDir packages/common
yarn dev-cli esbuild --pkg @beabee/client --global BeabeeClient --baseDir packages/client

# Development with watch mode
yarn dev-cli esbuild --pkg @beabee/client --global BeabeeClient --baseDir packages/client --watch
```

## Technical Details

- Runs TypeScript directly without compilation using Node.js experimental features
- All operations are async for better performance
- Generates sorted exports for consistent output
- Integrates with the shared @beabee/esbuild configuration

## Extending the CLI

To add new commands:

1. Create types in `src/types/your-command.ts`
2. Create action logic in `src/actions/your-command.ts`
3. Create command definition in `src/commands/your-command.ts`
4. Export from respective index files
5. Add command to `src/index.ts`

## Development

```bash
# Type checking
yarn workspace @beabee/dev-cli run check

# Format code
yarn workspace @beabee/dev-cli run format
```

## License

This project is part of Beabee and follows its licensing terms.
