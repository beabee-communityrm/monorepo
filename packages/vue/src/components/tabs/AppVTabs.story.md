# AppVTabs

The `AppVTabs` component provides vertical tab navigation, ideal for sidebar layouts and settings interfaces with multiple categories.

## Usage Patterns

- **Settings interfaces** - Navigate between different configuration sections
- **Sidebar navigation** - Vertical menu systems with content panels
- **Admin panels** - Organize management tools into categories
- **Multi-category forms** - Group form sections vertically for better space usage

## Key Features

- ✅ **Vertical orientation** - Space-efficient sidebar layout design
- ✅ **Responsive behavior** - Adapts to different screen sizes appropriately
- ✅ **Visual hierarchy** - Clear distinction between navigation and content
- ✅ **Count indicators** - Optional badges for tab item counts

## Usage

```vue
<AppVTabs
  v-model="selectedTab"
  :items="[
    { id: 'all', label: 'All Items', count: 42 },
    { id: 'active', label: 'Active', count: 18 },
  ]"
/>
```
