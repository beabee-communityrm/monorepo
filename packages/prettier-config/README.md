# @beabee/prettier-config

Shared Prettier configuration for all packages in the monorepo.

## Installation

```bash
# Using yarn
yarn add -D @beabee/prettier-config

# Using npm
npm install --save-dev @beabee/prettier-config
```

## Usage

### Basic Configuration
Create or update your `.prettierrc.mjs` file:

```javascript
import { baseConfig } from '@beabee/prettier-config';

export default baseConfig;
```

### Frontend Configuration
For frontend projects with Tailwind CSS support:

```javascript
import { frontendConfig } from '@beabee/prettier-config';

export default frontendConfig;
```

## Requirements

This package has the following peer dependencies:
- `prettier` (^3.x)

## Contributing

If you need to modify the Prettier configuration, please update it in this package rather than in individual projects to maintain consistency across the monorepo.
