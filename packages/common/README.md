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
import { parseDate } from '@beabee/beabee-common';

parseDate('2022'); // Returns: [ 2021-12-31T23:00:00.000Z, 'y' ]
```

## Development

### Build Process

To build the project, run:

```bash
yarn install
yarn build
```

## License

`beabee-common` is licensed under the [AGPL-3.0](./LICENSE) license.
