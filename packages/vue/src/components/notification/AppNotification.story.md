# AppNotification

The `AppNotification` component displays toast notifications with different variants for user feedback and system messages.

## Usage Patterns

- **Success feedback** - Confirm successful operations (save, delete, update)
- **Error alerts** - Display error messages and validation failures
- **Information updates** - Show system status or informational messages
- **Warning notifications** - Alert users to important conditions or actions

## Key Features

- ✅ **Multiple variants** - Success, error, warning, and info styles
- ✅ **Auto-dismiss** - Optional automatic removal after timeout
- ✅ **Action buttons** - Optional buttons for user interaction
- ✅ **Accessibility** - Screen reader announcements and keyboard support

## Usage

```vue
<AppNotification title="Operation Successful" variant="success">
  <p>Your changes have been saved successfully.</p>
</AppNotification>
```
