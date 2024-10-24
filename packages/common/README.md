# beabee-common

`beabee-common` is a shared codebase utilized across Beabee projects, compatible
with Node.js, Deno, and web browsers.

## Installation

To install `beabee-common`, use the following command:

```bash
npm install @beabee/beabee-common --save
```

## Usage

### Node.js

In a Node.js environment, use `beabee-common` as follows:

```ts
import { parseDate } from "@beabee/beabee-common";

parseDate("2022"); // Returns: [ 2021-12-31T23:00:00.000Z, 'y' ]
```

### Deno

Support for Deno is planned. Details on publishing to deno.land will be provided
in the future.

## Development

### Build Process

To build the project, run:

```bash
yarn install
yarn build # or `deno task build`
```

### Scripts

Scripts for NPM and Deno tasks are synchronized, ensuring consistency whether
you use `yarn ...` or `deno task ...`. They are defined in both `package.json`
and `deno.jsonc`. New scripts can be synchronized with via `deno task cli sync`
or `yarn cli sync`.

Key scripts include:

#### `cli`

A CLI tool for managing the project. It is a Deno CLI application that allows
for the management of the project via the command line. It is used to build the
project, sync runtime configurations between `package.json` and `deno.jsonc`, and
generate index.ts files.

```bash
yarn cli --help # or `deno task cli --help`
```

#### `build`

Node.js builds are created using [esbuild](https://esbuild.github.io/) from Deno
source. Deno projects can directly utilize TypeScript source from `./mod.ts`.

This runs several sub-scripts:

- `build:types` - Generates TypeScript types using the `tsc` compiler.
- `build:node` - Generates a Deno-compatible Node.js bundle using `esbuild`.
  - `build:node:cjs` - Generates a Deno-compatible Node.js bundle using
    `esbuild`.
  - `build:node:esm` - Generates a Deno-compatible Node.js bundle using
    `esbuild`.
- `build:browser` - Generates a browser-compatible bundle using `esbuild`.
  - `build:browser:esm` - Generates a browser-compatible ESM bundle using
    `esbuild`.
  - `build:browser:cdn` - Generates a browser-compatible CDN bundle using
    `esbuild`.

Deno's support for NPM packages differs in syntax, e.g., `date-fns` is imported
as `import { format } from "npm:date-fns";` in Deno, and
`import { format } from "date-fns";` in Node.js. Aliases in `deno.jsonc` enable
consistent codebase usage across environments.

#### `sync`

Synchronizes dependencies and scripts across `package.json` and `deno.jsonc` to
establishing necessary aliases in Deno and to make the scripts callable from
both.

#### `generate:index`

Generates `index.ts` files.

#### `format`

Formats code using
[Deno's standard formatter](https://docs.deno.com/runtime/manual/tools/formatter).

#### `lint`

Lints code using
[Deno's standard linter](https://docs.deno.com/runtime/manual/tools/linter).

#### `test`

Testing is divided into several scripts:

- `test:types` - Checks for type errors using `tsc`.
- `test:deno` - Main tests using
  [Deno's standard testing framework](https://docs.deno.com/runtime/manual/basics/testing/).
- `test:node`:
  - `test:node:esm` - Tests ESM build importability in Node.js.
  - `test:node:cjs` - Tests CJS build importability in Node.js.

#### `watch` or `dev`

Watches for changes to the codebase and runs the appropriate scripts.

### Manage Dependencies

You can use dependencies for both NPM and Deno. When incorporating Deno
packages, they must be bundled for Node.js compatibility.

For integrating NPM dependencies, consult the `sync` script which ensures
synchronization between the dependency configurations for both environments.

### Cross Platform Compatibility

This module is cross platform independent and can be used under Node.js, Deno
and in the browser. Therefore, please do not use any runtime APIs from Node.js,
Deno or the Web API unless it is available in all these runtimes.

## License

`beabee-common` is licensed under the [AGPL-3.0](./LICENSE) license.
