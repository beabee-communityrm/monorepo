# beabee-common

`beabee-common` is a shared codebase utilized across Beabee projects.

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

## Development

### Build Process

To build the project, run:

```bash
yarn install
yarn build
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

Node.js builds are created using [esbuild](https://esbuild.github.io/).

#### `generate:index`

Generates `index.ts` files.

#### `format`

Formats code using `prettier`.

#### `lint`

Lints code using `eslint`.

#### `test`

Testing is divided into several scripts:

- `test:types` - Checks for type errors using `tsc`.
- `test:esm` - Tests ESM build importability in Node.js.
- `test:cjs` - Tests CJS build importability in Node.js.

#### `watch` or `dev`

Watches for changes to the codebase and runs the appropriate scripts.

## License

`beabee-common` is licensed under the [AGPL-3.0](./LICENSE) license.
