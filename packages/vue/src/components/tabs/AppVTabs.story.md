# AppVTabs

Vertical tabs optimized for sidebar navigation and filtering interfaces.

## Usage

```vue
<AppVTabs
  v-model="selectedTab"
  :items="[
    { id: 'all', label: 'All Items', count: 42 },
    { id: 'active', label: 'Active', count: 18 }
  ]"
/>
```

## Props

| Prop         | Type        | Required | Description                   |
| ------------ | ----------- | -------- | ----------------------------- |
| `modelValue` | `string`    | Yes      | Currently selected tab ID     |
| `items`      | `TabItem[]` | Yes      | Array of tab items to display |

## Features

- Vertical layout optimized for sidebars
- Count indicators
- v-model support for two-way binding
- Consistent styling with other tab components

## Use Cases

### Filter Sidebar

Common pattern for list views with filtering:

```vue
<AppVTabs
  v-model="selectedFilter"
  :items="[
    { id: 'all', label: 'All Items', count: 42 },
    { id: 'active', label: 'Active', count: 18 },
    { id: 'archived', label: 'Archived', count: 24 }
  ]"
/>
```

### Content Navigation

Used for navigating between different sections of content:

```vue
<AppVTabs
  v-model="selectedSection"
  :items="[
    { id: 'content', label: 'Content' },
    { id: 'intro', label: 'Introduction' },
    { id: 'endMessage', label: 'End Message' }
  ]"
/>
``` 
