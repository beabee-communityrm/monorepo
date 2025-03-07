# AppTabs

The primary tabs component that supports both horizontal and vertical orientations, router integration, and count indicators.

## Usage

```vue
<AppTabs
  :items="[
    { id: 'tab1', label: 'Overview' },
    { id: 'tab2', label: 'Settings', count: 3 },
    { id: 'tab3', label: 'Security', to: '/security' },
  ]"
  :selected="selectedTab"
  orientation="horizontal"
  @tab-click="handleTabClick"
/>
```

## Props

| Prop          | Type                         | Default      | Description                      |
| ------------- | ---------------------------- | ------------ | -------------------------------- |
| `items`       | `TabItem[]`                  | `[]`         | Array of tab items to display    |
| `selected`    | `string \| null`             | `null`       | ID of the currently selected tab |
| `orientation` | `'horizontal' \| 'vertical'` | `horizontal` | Layout orientation of the tabs   |
| `defaultTab`  | `string \| undefined`        | `undefined`  | Default tab to fall back to      |

## Events

| Event       | Arguments      | Description                              |
| ----------- | -------------- | ---------------------------------------- |
| `tab-click` | `(id: string)` | Emitted when a non-router tab is clicked |

## Common Use Cases

### Navigation Tabs

Used for top-level navigation in admin interfaces:

```vue
<AppTabs
  :items="[
    { id: 'overview', label: 'Overview', to: '/overview' },
    { id: 'settings', label: 'Settings', to: '/settings' },
  ]"
  :selected="currentRoute"
/>
```

### Content Builder Tabs

Used in form builders and content editors:

```vue
<AppTabs
  :items="[
    { id: 'content', label: 'Content' },
    { id: 'settings', label: 'Settings' },
    { id: 'dates', label: 'Dates & Duration' },
  ]"
  :selected="selectedTab"
  @tab-click="handleTabClick"
/>
```

## Accessibility

- Uses proper ARIA roles (`role="tablist"`, `role="tab"`)
- Supports keyboard navigation
- Includes ARIA labels and states for screen readers
