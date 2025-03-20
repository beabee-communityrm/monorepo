# AppTabs

The primary tabs component that supports both horizontal and vertical orientations, router integration, and count indicators. When in horizontal orientation, it provides automatic horizontal scrolling when there are too many tabs to fit the available width.

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

## Features

- **Horizontal scrolling**: When in horizontal orientation, the component automatically adds horizontal scrolling if there are too many tabs to fit in the available width
- **No line breaks**: Tab labels never break into multiple lines, ensuring consistent UI
- **Router integration**: Supports both router-based navigation and click events

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

### Many Tabs with Horizontal Scrolling

When you have many tabs that don't fit in the available width:

```vue
<div class="w-full">
  <AppTabs
    :items="manyTabs" <!-- An array with many tab items -->
    :selected="selectedTab"
    @tab-click="handleTabClick"
  />
</div>
```

## Accessibility

- Uses proper ARIA roles (`role="tablist"`, `role="tab"`)
- Supports keyboard navigation
- Includes ARIA labels and states for screen readers
