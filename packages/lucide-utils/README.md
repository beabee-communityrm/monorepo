# @beabee/lucide-utils

Utilities for working with Lucide icons in the beabee monorepo.

## Features

- **Icon Metadata Processing**: Fetch and process metadata for all Lucide icons
- **Search & Filtering**: Advanced search capabilities for icons by name, tags, and categories
- **Category Management**: Organize icons by categories with metadata
- **TypeScript Support**: Full type definitions for all icon data and utilities

## Update Process

Run the update script to fetch the latest icon metadata from Lucide's GitHub repository:

```bash
yarn update
```

This will:

1. Iterate through all available Lucide icons
2. Convert camelCase names to kebab-case for API calls
3. Fetch metadata from `https://raw.githubusercontent.com/lucide-icons/lucide/refs/heads/main/icons/{icon-name}.json`
4. Generate TypeScript data files in `src/data/`
5. Create utility functions for searching and filtering

## Usage

### Basic Search

```typescript
import { iconData, searchIcons } from '@beabee/lucide-utils';

// Search by name or tags
const results = searchIcons(iconData, {
  query: 'arrow',
  categories: ['arrows'],
  includeDeprecated: false,
});
```

### Category Filtering

```typescript
import {
  getAvailableCategories,
  getIconsByCategories,
} from '@beabee/lucide-utils';

// Get all icons in specific categories
const arrowIcons = getIconsByCategories(iconData, ['arrows']);

// Get available categories with icon counts
const categories = getAvailableCategories(iconData, categoryData);
```

### Related Icons

```typescript
import { getIconByName, getRelatedIcons } from '@beabee/lucide-utils';

const targetIcon = getIconByName('ArrowUp', iconData);
if (targetIcon) {
  const related = getRelatedIcons(targetIcon, iconData, 5);
}
```

## Generated Data Structure

The update process generates:

- `src/data/icons.ts` - All icon metadata
- `src/data/categories.ts` - Category information with icon counts
- `src/data/index.ts` - Combined exports

## For Icon Picker Development

This package provides all necessary utilities for building an icon picker:

- Search functionality across names and tags
- Category-based filtering
- Related icon suggestions
- Type-safe interfaces

Run `yarn update` after any Lucide version updates to ensure metadata is current.
