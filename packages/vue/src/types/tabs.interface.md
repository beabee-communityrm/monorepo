# Tab Components Interfaces

Common interfaces used by all tab components.

## TabItem Interface

The `TabItem` interface represents a single tab in a tab navigation component. It includes all the necessary properties to display and manage tab behavior within the application.

```typescript
export interface TabItem {
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
  /** Indicates if the tab content has validation errors */
  error?: boolean;
  /** Indicates if the tab content has been successfully validated */
  validated?: boolean;
}
```

### Properties

| Property    | Type      | Required | Description                                 |
| ----------- | --------- | -------- | ------------------------------------------- |
| `id`        | `string`  | Yes      | Unique identifier for the tab               |
| `label`     | `string`  | Yes      | Display text for the tab                    |
| `count`     | `number`  | No       | Optional count indicator to display         |
| `to`        | `string`  | No       | Optional route path for router-link         |
| `hidden`    | `boolean` | No       | Whether the tab should be hidden            |
| `error`     | `boolean` | No       | Indicates if tab content has errors         |
| `validated` | `boolean` | No       | Indicates if tab content has been validated |

### Examples

#### Basic Tab

```typescript
const basicTab: TabItem = {
  id: 'settings',
  label: 'Settings',
};
```

#### Tab with Route

```typescript
const routerTab: TabItem = {
  id: 'users',
  label: 'Users',
  to: '/users',
};
```

#### Tab with Count

```typescript
const tabWithCount: TabItem = {
  id: 'notifications',
  label: 'Notifications',
  count: 5,
};
```

#### Tab with Validation State

```typescript
const validatedTab: TabItem = {
  id: 'profile',
  label: 'Profile',
  validated: true,
};
```

#### Tab with Error State

```typescript
const errorTab: TabItem = {
  id: 'payment',
  label: 'Payment',
  error: true,
};
```

#### Hidden Tab

```typescript
const hiddenTab: TabItem = {
  id: 'advanced',
  label: 'Advanced Settings',
  hidden: true,
};
```

## Accessibility

All tab components follow WAI-ARIA guidelines for tabs:

- Uses proper ARIA roles (`role="tablist"`, `role="tab"`, `role="tabpanel"`)
- Supports keyboard navigation (arrow keys, Home/End)
- Provides proper focus management
- Includes ARIA labels and states for screen readers

## Responsive Design

- `AppTabs` adapts to both horizontal and vertical layouts
- `AppTabsCompact` provides touch-friendly mobile experience
- `AppVTabs` collapses into `AppTabsCompact` on mobile screens when used with `AppFilterGrid`
