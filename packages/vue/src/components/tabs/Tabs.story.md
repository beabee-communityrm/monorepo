# Tabs Components

A collection of tab components that provide different ways to create tabbed interfaces in your application. The tabs components are designed to be flexible, accessible and consistent with the design system.

## Components Overview

- `AppTabs`: Main tabs component supporting both horizontal and vertical layouts
- `AppTabsCompact`: Mobile-friendly compact tabs with horizontal scrolling
- `AppVTabs`: Vertical tabs optimized for sidebar navigation

## AppTabs

The primary tabs component that supports both horizontal and vertical orientations, router integration, and count indicators.

### Usage

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

### Props

| Prop          | Type                         | Default      | Description                      |
| ------------- | ---------------------------- | ------------ | -------------------------------- |
| `items`       | `TabItem[]`                  | `[]`         | Array of tab items to display    |
| `selected`    | `string \| null`             | `null`       | ID of the currently selected tab |
| `orientation` | `'horizontal' \| 'vertical'` | `horizontal` | Layout orientation of the tabs   |
| `defaultTab`  | `string \| undefined`        | `undefined`  | Default tab to fall back to      |

### Events

| Event       | Arguments      | Description                              |
| ----------- | -------------- | ---------------------------------------- |
| `tab-click` | `(id: string)` | Emitted when a non-router tab is clicked |

## AppTabsCompact

A compact version of tabs designed for mobile views. Features horizontal scrolling and snap points for better touch interaction.

### Usage

```vue
<AppTabsCompact
  v-model="selectedTab"
  :items="[
    { id: 'inbox', label: 'Inbox', count: 12 },
    { id: 'sent', label: 'Sent', count: 5 },
  ]"
/>
```

### Props

| Prop         | Type        | Required | Description                   |
| ------------ | ----------- | -------- | ----------------------------- |
| `modelValue` | `string`    | Yes      | Currently selected tab ID     |
| `items`      | `TabItem[]` | Yes      | Array of tab items to display |

## AppVTabs

Vertical tabs optimized for sidebar navigation and filtering interfaces.

### Usage

```vue
<AppVTabs
  v-model="selectedTab"
  :items="[
    { id: 'all', label: 'All Items', count: 42 },
    { id: 'active', label: 'Active', count: 18 },
  ]"
/>
```

### Props

| Prop         | Type        | Required | Description                   |
| ------------ | ----------- | -------- | ----------------------------- |
| `modelValue` | `string`    | Yes      | Currently selected tab ID     |
| `items`      | `TabItem[]` | Yes      | Array of tab items to display |

## TabItem Interface

The common interface used by all tab components:

```typescript
interface TabItem {
  /** Unique identifier for the tab */
  id: string;
  /** Display text for the tab */
  label: string;
  /** Optional count or status indicator */
  count?: number;
  /** Optional route path for router-link navigation */
  to?: string;
  /** Whether the tab should be hidden */
  hidden?: boolean;
}
```

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

### Filter Sidebar

Common pattern for list views with filtering:

```vue
<AppVTabs
  v-model="selectedFilter"
  :items="[
    { id: 'all', label: 'All Items', count: 42 },
    { id: 'active', label: 'Active', count: 18 },
    { id: 'archived', label: 'Archived', count: 24 },
  ]"
/>
```

## Accessibility

The tabs components follow WAI-ARIA guidelines for tabs:

- Uses proper ARIA roles (`role="tablist"`, `role="tab"`, `role="tabpanel"`)
- Supports keyboard navigation (arrow keys, Home/End)
- Provides proper focus management
- Includes ARIA labels and states for screen readers

## Responsive Design

- `AppTabs` adapts to both horizontal and vertical layouts
- `AppTabsCompact` provides touch-friendly mobile experience
- `AppVTabs` collapses into `AppTabsCompact` on mobile screens when used with `AppFilterGrid`
