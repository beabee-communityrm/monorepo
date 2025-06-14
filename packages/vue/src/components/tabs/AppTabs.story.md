# AppTabs

The `AppTabs` component provides a standard horizontal tab navigation interface for organizing content into distinct sections.

## Usage Patterns

- **Content organization** - Separate related content into manageable sections
- **Settings panels** - Group configuration options by category
- **Data views** - Switch between different data representations
- **Multi-step processes** - Navigate between process stages

## Key Features

- ✅ **Horizontal layout** - Standard tab bar with clean design
- ✅ **Active state indicators** - Clear visual feedback for selected tabs
- ✅ **Keyboard navigation** - Arrow keys and Tab support for accessibility
- ✅ **Flexible content** - Any content can be displayed in tab panels

## Usage

```vue
<AppTabs
  :items="[
    { id: 'tab1', label: 'Overview' },
    { id: 'tab2', label: 'Settings', count: 3 },
    { id: 'tab3', label: 'Security', to: '/security' },
    { id: 'tab4', label: 'Validation', validated: true },
    { id: 'tab5', label: 'Errors', error: true },
  ]"
  :selected="selectedTab"
  orientation="horizontal"
  @tab-click="handleTabClick"
/>
```
