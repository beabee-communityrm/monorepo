# Tab Components Interfaces

Common interfaces used by all tab components.

## TabItem Interface

The core interface used by all tab components:

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
