# @beabee/fontawesome

> **Complete FontAwesome integration package with advanced search, filtering, and icon picker functionality**

A comprehensive TypeScript package for managing FontAwesome icons in the beabee monorepo. Provides service-based architecture with powerful search capabilities, category filtering, and utilities optimized for building modern icon picker components.

## 🚀 Features

- **🔍 Advanced Icon Search** - Full-text search with fuzzy matching and relevance scoring
- **🏷️ Category & Style Filtering** - Filter icons by FontAwesome categories and styles
- **💡 Autocomplete Suggestions** - Smart suggestions for partial queries
- **📊 Statistics & Analytics** - Category statistics with icon counts and popular icons
- **🎨 CSS Integration** - Generate FontAwesome CSS classes automatically
- **⚡ Performance Optimized** - Efficient indexing for 1,895+ icons
- **🔧 TypeScript-First** - Full type safety and excellent developer experience
- **🧪 Fully Tested** - Comprehensive test suite with 36+ tests

## 📦 Installation

```bash
# Already available in the beabee monorepo
yarn workspace @beabee/your-app add @beabee/fontawesome
```

## 🎯 Quick Start

### Basic Icon Search

```typescript
import { IconSearchService } from '@beabee/fontawesome';

const iconService = new IconSearchService();

// Search for icons
const heartIcons = iconService.searchIcons('heart');
const userIcons = iconService.searchIcons('user', 5); // Limit to 5 results

// Advanced search with relevance scoring
const results = iconService.searchWithRelevance('love');
results.forEach((result) => {
  console.log(
    `${result.icon.name}: ${result.relevanceScore} (${result.matchType})`
  );
});
```

### Category & Style Filtering

```typescript
// Filter by categories
const socialIcons = iconService.filterIcons({
  categories: ['social', 'communication'],
});

// Filter by styles
const solidIcons = iconService.filterIcons({
  styles: ['solid'],
});

// Combined filtering with search
const businessCards = iconService.filterIcons({
  categories: ['business'],
  styles: ['solid'],
  query: 'card',
});
```

### Autocomplete Suggestions

```typescript
// Get suggestions for partial input
const suggestions = iconService.getIconSuggestions('ho', 10);
// Returns icons starting with "ho": house, home, hospital, etc.
```

### Category Management

```typescript
// Get all categories with statistics
const categoriesWithStats = iconService.getCategoriesWithStats();
categoriesWithStats.forEach((category) => {
  console.log(`${category.label}: ${category.iconCount} icons`);
  console.log(
    'Popular icons:',
    category.popularIcons.map((i) => i.name)
  );
});

// Get icons from specific category
const businessIcons = iconService.getIconsByCategory('business');
```

## 🛠️ Utility Functions

### CSS Class Generation

```typescript
import { generateIconClassName, getStylePrefix } from '@beabee/fontawesome';

// Generate FontAwesome CSS classes
const className = generateIconClassName('heart', 'solid'); // "fas fa-heart"
const prefix = getStylePrefix('regular'); // "far"
```

### Icon Information

```typescript
import {
  formatIconForDisplay,
  getIconUnicode,
  iconSupportsStyle,
} from '@beabee/fontawesome';

// Get Unicode character
const unicode = getIconUnicode('heart'); // "f004"

// Check style support
const supportsRegular = iconSupportsStyle('heart', 'regular'); // true

// Format for UI display
const displayData = formatIconForDisplay(heartIcon);
// Returns: { name, label, displayName, primaryStyle, availableStyles, categories, className }
```

## ⚙️ Configuration

```typescript
import { IconSearchService } from '@beabee/fontawesome';

const iconService = new IconSearchService({
  enableFuzzy: true, // Enable fuzzy search
  fuzzyThreshold: 0.2, // Fuzzy search sensitivity
  enablePrefix: true, // Enable prefix matching
  maxResults: 1000, // Maximum search results
});

// Update configuration
iconService.updateConfig({
  maxResults: 50,
  enableFuzzy: false,
});
```

## 📊 Package Architecture

```
src/
├── data/           # Generated FontAwesome data
│   ├── icons.ts    # All FontAwesome icons (1,895+)
│   └── categories.ts # Icon categories (50+)
├── services/       # Core business logic
│   └── icon-search.service.ts # Main search service
├── types/          # TypeScript definitions
│   ├── core.ts     # Core FontAwesome types
│   ├── search.ts   # Search and filtering types
│   ├── picker.ts   # Icon picker specific types
│   └── metadata.ts # Metadata processing types
├── utils/          # Utility functions
│   └── icon-utils.ts # CSS generation and helpers
└── scripts/        # Build and maintenance
    └── update.ts   # FontAwesome data update script
```

## 🎨 Icon Picker Integration Example

```typescript
import {
  IconSearchService,
  formatIconForDisplay,
  generateIconClassName,
} from '@beabee/fontawesome';

class IconPicker {
  private iconService = new IconSearchService();

  async searchIcons(query: string) {
    const results = await this.iconService.searchIcons(query, 20);
    return results.map((icon) => ({
      ...formatIconForDisplay(icon),
      cssClass: generateIconClassName(icon.name, icon.styles[0]),
    }));
  }

  async getCategories() {
    return this.iconService.getCategoriesWithStats();
  }

  async getSuggestions(partial: string) {
    return this.iconService.getIconSuggestions(partial, 10);
  }
}
```

## 🔄 Data Updates

Update FontAwesome data from the latest FontAwesome release:

```bash
cd packages/fontawesome
yarn update
```

This regenerates the TypeScript data files from FontAwesome metadata.

## 🧪 Testing

```bash
# Run tests
yarn test

# Watch mode for development
yarn test:watch

# Type checking
yarn check:tsc
```

## 📈 Performance

- **Indexed Search**: MiniSearch provides efficient full-text search
- **Lazy Loading**: Search index initialized only when needed
- **Memory Efficient**: Optimized data structures for large icon sets
- **Fast Filtering**: Efficient category and style filtering algorithms

## 🔧 Development

### Scripts Available

```bash
yarn test           # Run test suite
yarn test:watch     # Run tests in watch mode
yarn update         # Update FontAwesome data
yarn check          # Run all checks (TypeScript + Prettier)
yarn format         # Format code with Prettier
```

## 📝 API Reference

### IconSearchService

| Method                     | Description                  | Parameters                        | Returns                    |
| -------------------------- | ---------------------------- | --------------------------------- | -------------------------- |
| `searchIcons()`            | Basic icon search            | `query: string, limit?: number`   | `FontAwesome[]`            |
| `searchWithRelevance()`    | Advanced search with scoring | `query: string, limit?: number`   | `SearchResult[]`           |
| `filterIcons()`            | Filter by categories/styles  | `options: IconFilterOptions`      | `FontAwesome[]`            |
| `getIconSuggestions()`     | Autocomplete suggestions     | `partial: string, limit?: number` | `FontAwesome[]`            |
| `getIconsByCategory()`     | Icons from category          | `categoryId: string`              | `FontAwesome[]`            |
| `getCategoriesWithStats()` | Categories with statistics   | -                                 | `CategoryWithStats[]`      |
| `iconExists()`             | Check if icon exists         | `iconName: string`                | `boolean`                  |
| `getIcon()`                | Get specific icon            | `iconName: string`                | `FontAwesome \| undefined` |

### Utility Functions

| Function                  | Description           | Parameters                         | Returns               |
| ------------------------- | --------------------- | ---------------------------------- | --------------------- |
| `generateIconClassName()` | Generate CSS class    | `iconName: string, style?: string` | `string`              |
| `getStylePrefix()`        | Get style prefix      | `style: string`                    | `string`              |
| `getIconUnicode()`        | Get Unicode character | `iconName: string`                 | `string \| undefined` |
| `iconSupportsStyle()`     | Check style support   | `iconName: string, style: string`  | `boolean`             |
| `formatIconForDisplay()`  | Format for UI         | `icon: FontAwesome`                | `DisplayIcon`         |

## 📄 License

This package is part of the beabee monorepo and follows the same licensing terms.
