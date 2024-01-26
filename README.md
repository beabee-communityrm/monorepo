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

Since this module uses Deno as the main runtime but also generates builds for
Node.js, both runtimes are necessary dependencies for development:

- Deno latest stable version
- Node.js latest stable version

### Build

```bash
npm install
npm run build # or deno task build
```

### Scripts

The NPM scripts and the Deno tasks are synchronised with each other, so it
doesn't matter if you run `npm run ...` or `deno task ...`, both should work and
you can use whichever you prefer. They are defined in the `package.json` and
`deno.json` and must be entered manually if new ones are to be added.

The most important scripts are:

#### `build`

This executes the scripts `build:types`, `build:node:cjs` and `build:node:esm`:

- `build:types` - This script generates the TypeScript types using the `tsc`
  compiler.
- `build:node`:
  - `build:node:cjs` - This script generates the CommonJS bundle using the
    `esbuild` bundler, the script is located in `./scripts/esbuild.cjs.ts`.
  - `build:node:esm` - This script generates the ESM bundle using the `esbuild`
    bundler, the script is located in `./scripts/esbuild.esm.ts`.

The Node.js build scripts are using [esbuild](https://esbuild.github.io/) to
generate outputs for ESM and CommonJS from the Deno source. Deno projects itself
can directly use the TypeScript source with the starting entry point of
`./mod.ts`.

Deno has support for NPM packages, so we can also use them here, but Deno has
its own import syntax for this. The names of the NPM packages must always start
with `npm:`. For example, the NPM package `date-fns` must be imported as
`import { format } from "npm:date-fns";` in Deno and in Node.js as ``import {
format } from
"date-fns";`. But Deno also has support for aliases, so we can create an alias for`date-fns`which points to`npm:date-fns`,
this way we can support importing NPM packages for both runtime environments
with the same codebase. And this is where the next script comes into play:

#### `sync:deps`

This script syncs the dependencies for both runtime environments from the
`package.json` to the `deno.json` where the aliases for Deno are placed. You can
find the script at `./scripts/sync-deps.ts`.

#### `generate:index`

This is a simple script to generate index.ts files, you can find it at
`./scripts/generate-index.ts`

#### `format`

This formats the code, we use the standard formatter from Deno for this.

#### `lint`

This checks the code for linting errors. Here we also use the standard linter
from Deno.

#### `test`

The tests are spitted into several scripts:

- `test:types` - Uses the `tsc` without creating files to check if there are
  type errors.
- `test:deno` - This is the main test and uses the standard testing framework
  that comes with Deno.
- `test:node`:
  - `build:node:esm` - A simple test that checks whether the ESM build can be
    imported into Node.js without errors using `import`.
  - `build:node:cjs` - A simple test that checks whether the CJS build can be
    imported into Node.js without errors using `require`.

## License

Licensed under the [AGPL-3.0](./LICENSE) license.
