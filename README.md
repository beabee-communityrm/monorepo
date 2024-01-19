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

- Deno latest stable version
- Node.js latest stable version

### Build

```bash
npm install
npm run build
```

## License

Licensed under the [AGPL-3.0](./LICENSE) license.
