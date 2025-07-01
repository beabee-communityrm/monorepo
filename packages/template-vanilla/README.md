# @beabee/template-vanilla

This is a minimal template package for creating new packages in the beabee monorepo. It provides a standardized structure for packages that export TypeScript sources directly without a build system - this is the **preferred and most minimalist approach**.

## Creating a New Package

Follow these steps to create a new package based on this template:

### 1. Copy the template package

```bash
cp -r packages/template-vanilla packages/your-package
```

### 2. Replace names and descriptions

Update the following files to replace `@beabee/template-vanilla` with your new package name (e.g., `@beabee/your-package`):

- `package.json`: Update the `name` field and add an appropriate description
- `README.md`: Replace the package name in the title and update the description

### 3. Update dependencies

Run yarn install to update the yarn.lock file with your new package:

```bash
yarn install
```

### 4. Update Docker configuration

Add your new package to the Docker base image by updating `packages/docker/base.dockerfile`. Add the following line in the "Copy dependencies info from packages" section:

```dockerfile
COPY --chown=node:node packages/your-package/package.json /opt/packages/your-package/package.json
```

**Important**: This step is crucial! Without it, Docker builds will fail because the yarn.lock file changes when packages are missing from the Docker context.

### 5. Commit to git

Add your new package to git as the starting point:

```bash
git add packages/your-package packages/docker/base.dockerfile
git commit -m "feat: add @beabee/your-package template"
```

### 6. Customize your package

Now you can start developing your package:

- Remove example files: `src/index.test.ts` and `src/utils/hello.ts` (these are only for demonstration)
- Remove or adapt the `test` script in `package.json` to match your actual testing needs
- Add your source code to the `src/` directory
- Update dependencies in `package.json` as needed
- Add tests and documentation

## Template Approach

This template follows the **direct TypeScript export approach** - the most minimalist method where TypeScript sources are exported directly without any build process. This approach is preferred because:

- **Simplicity**: No build configuration needed
- **Performance**: No build step required during development
- **Transparency**: Consumers see the actual source code
- **Type Safety**: Full TypeScript support without compilation

## Alternative Approaches

If your package requires different capabilities, refer to these examples:

### Build System Required (ESBuild)

For packages that need compiled outputs (e.g., CJS builds, browser bundles), refer to **`@beabee/client`**:

- ESBuild-based build configuration
- Multiple output formats (ESM, CJS, browser)
- TypeScript compilation with type declarations

### Vue Components

For packages containing Vue components and dependencies, refer to **`@beabee/vue`**:

- Vue 3 component library structure
- Vite build configuration
- Component documentation with Histoire
- Tailwind CSS integration

## Directory Structure

```
packages/your-package/
├── package.json          # Package configuration
├── index.ts              # Main entry point
├── README.md             # Package documentation
├── tsconfig.json         # TypeScript configuration
├── .prettierrc.mjs       # Prettier configuration
└── src/
    ├── index.ts          # Main source entry point
    ├── index.test.ts     # Test file demonstrating direct TS execution
    ├── types/            # TypeScript type definitions
    │   └── index.ts      # Type exports
    └── utils/            # Utility functions
        ├── index.ts      # Utility exports
        └── hello.ts      # Example utility function
```

## Usage in Monorepo

After creating your package, you can:

- Import it in other packages: `import { something } from '@beabee/your-package'`
- Run package-specific commands: `yarn workspace @beabee/your-package run check`
- Add it as a dependency to other workspace packages

## Development

Since this template uses direct TypeScript exports, no build step is required. Simply:

1. Write your TypeScript code in the `src/` directory
2. Export what you need through `index.ts`
3. Import and use in other packages immediately

### Available Scripts

The template includes helpful development scripts:

```bash
# Run test to verify TypeScript source imports work directly with Node.js
yarn workspace @beabee/your-package run test

# Type checking without emitting files
yarn workspace @beabee/your-package run check

# Format code with Prettier
yarn workspace @beabee/your-package run format
```

The `test` script demonstrates how TypeScript sources can be executed directly with Node.js using the `--experimental-strip-types` and `--experimental-transform-types` flags, without requiring a build step. This serves both as a verification that imports work correctly and as an example of running TypeScript directly.

**Note**: The test script and example files (`src/index.test.ts`, `src/utils/hello.ts`) are only for demonstration purposes and should be removed or adapted when creating your actual package.

### Configuration Files

- **`tsconfig.json`**: Extends `@beabee/tsconfig/tsconfig.vanilla.json` for consistent TypeScript configuration
- **`.prettierrc.mjs`**: Uses `@beabee/prettier-config` for consistent code formatting across the monorepo
