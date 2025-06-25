# AppStatusPage

The `AppStatusPage` component provides a full-page layout for displaying status messages, error states, and empty content scenarios.

## Usage Patterns

- **Error pages** - 404, 500, and other error states with actions
- **Empty states** - No data scenarios with helpful guidance
- **Loading states** - Full-page loading indicators with context
- **Success confirmations** - Confirmation pages after important actions

## Key Features

- ✅ **Full-page layout** - Centered content with consistent spacing
- ✅ **Icon support** - Visual icons to reinforce message context
- ✅ **Action buttons** - Optional buttons for user next steps
- ✅ **Responsive design** - Adapts gracefully to all screen sizes

## Usage

```vue
<AppStatusPage
  title="Loading Application"
  message="Please wait while we connect to the server..."
  loading-text="Performing health checks"
  :show-progress="true"
  :progress="45"
  progress-text="Verifying database connectivity..."
/>
```
