# beabee-common

Shared code between Beabee projects for Node.js, Deno and the browser.

## Installation

```bash
npm install @beabee/beabee-common --save
```

## Usage

### Node.js

```typescript
import { parseDate } from "@beabee/beabee-common";

parseDate("2022"); // [ 2021-12-31T23:00:00.000Z, 'y' ]
```

### Deno

TODO: Publish to deno.land

## Development

### Requirements

Since this module uses Deno as the main runtime but also generates builds for Node.js, both runtimes are necessary dependencies for development:

- Deno latest stable version
- Node.js latest stable version

### Build

```bash
npm install
npm run build # or deno task build
```

### Scripts

The NPM scripts and the Deno tasks are synchronised with each other, so it doesn't matter if you run `npm run ...` or `deno task ...`, both should work and you can use whichever you prefer. They are defined in the `package.json` and `deno.json` and must be entered manually if new ones are to be added.

The most important scripts are:

#### `build`

This executes the scripts `build:types`, `build:node:cjs` and `build:node:esm`:

* `build:types` - This script generates the TypeScript types using the `tsc` compiler.
* `build:node:cjs` - This script generates the CommonJS bundle using the `esbuild` bundler, the script is located in `./scripts/esbuild.cjs.ts`
* `build:node:esm` - This script generates the ESM bundle using the `esbuild` bundler, the script is located in `./scripts/esbuild.esm.ts`

## License

Licensed under the [AGPL-3.0](./LICENSE) license.
