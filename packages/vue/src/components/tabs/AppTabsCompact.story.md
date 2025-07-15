# AppTabsCompact

The `AppTabsCompact` component provides a space-efficient tab interface with reduced padding and spacing for dense layouts.

## Usage Patterns

- **Mobile interfaces** - Conserve vertical space on smaller screens
- **Dashboard widgets** - Compact tabs for dense information displays
- **Embedded components** - Tabs within modal dialogs or sidebars
- **Content previews** - Quick switching between preview modes

## Key Features

- ✅ **Reduced spacing** - Compact design for space-constrained layouts
- ✅ **Mobile optimized** - Touch-friendly while maintaining small footprint
- ✅ **Same functionality** - All standard tab features in smaller package
- ✅ **Consistent styling** - Maintains design system coherence

## Usage

```vue
<AppTabsCompact
  v-model="selectedTab"
  :items="[
    { id: 'inbox', label: 'Inbox', count: 12 },
    { id: 'sent', label: 'Sent', count: 5 },
  ]"
/>
```
