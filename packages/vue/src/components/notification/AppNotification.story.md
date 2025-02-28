# AppNotification

The `AppNotification` component displays important messages to users with different visual styles based on the message type. It supports various configurations for different use cases, from inline form validation messages to toast-style notifications.

## Features

- Four variants: success, warning, error, and info
- Optional auto-removal functionality
- Support for both inline and normal display modes
- Accessible with proper ARIA attributes
- Optional icons
- Customizable content through slots
- Removable by default with a close button

## Usage

```vue
<AppNotification title="Operation Successful" variant="success">
  <p>Your changes have been saved successfully.</p>
</AppNotification>
```

## Props

| Prop          | Type                                          | Default    | Description                                     |
| ------------- | --------------------------------------------- | ---------- | ----------------------------------------------- |
| `id`          | `number`                                      | Random     | Unique identifier for the notification          |
| `variant`     | `'success' \| 'warning' \| 'error' \| 'info'` | -          | The type of notification (required)             |
| `title`       | `string`                                      | -          | The main notification message (required)        |
| `description` | `string`                                      | -          | Additional description for screen readers       |
| `icon`        | `IconDefinition`                              | -          | Optional icon to display                        |
| `removeable`  | `'auto' \| boolean`                           | `true`     | Whether and how the notification can be removed |
| `mode`        | `'normal' \| 'inline'`                        | `'normal'` | Display mode of the notification                |

## Events

| Event    | Description                              |
| -------- | ---------------------------------------- |
| `remove` | Emitted when the notification is removed |

## Examples

### Basic Variants

```vue
<!-- Success notification -->
<AppNotification title="Operation Successful" variant="success">
  <p>Your changes have been saved successfully.</p>
</AppNotification>

<!-- Warning notification -->
<AppNotification title="Warning" variant="warning">
  <p>This action will log you out of all devices.</p>
</AppNotification>

<!-- Error notification -->
<AppNotification title="Error" variant="error">
  <p>There was a problem processing your request.</p>
</AppNotification>

<!-- Info notification -->
<AppNotification title="Information" variant="info">
  <p>Your account will be updated in the next 24 hours.</p>
</AppNotification>
```

### Inline Mode

Useful for form validation messages or contextual information.

```vue
<AppNotification title="Form validation failed" variant="error" mode="inline" />
```

### With Icon

```vue
<AppNotification title="Information" variant="info" :icon="faInfoCircle">
  <p>This notification includes an icon.</p>
</AppNotification>
```

### Auto-Remove

The notification will automatically remove itself after a few seconds.

```vue
<AppNotification
  title="This will disappear automatically"
  variant="info"
  removeable="auto"
  @remove="handleNotificationRemoved"
/>
```

### Not Removeable

The notification cannot be dismissed by the user.

```vue
<AppNotification
  title="Important Information"
  variant="warning"
  :removeable="false"
>
  <p>This notification cannot be dismissed.</p>
</AppNotification>
```

### In a Form Box

```vue
<AppFormBox
  title="Danger Zone"
  :notification="{
    title: 'Warning',
    description: 'These actions cannot be undone.',
    variant: 'warning',
    mode: 'inline',
    removeable: false,
  }"
>
  <!-- Form fields -->
</AppFormBox>
```

### In a Notification Container

```vue
<div class="notifications-container">
  <AppNotification
    v-for="notification in notifications"
    :key="notification.id"
    :id="notification.id"
    :title="notification.title"
    :description="notification.description"
    :variant="notification.variant"
    :removeable="notification.removeable"
    @remove="removeNotification(notification.id)"
  />
</div>
```

## How It Works

The AppNotification component:

1. Renders a notification with appropriate styling based on the variant
2. Displays the title and optional content
3. Shows a close button if the notification is removeable
4. Automatically removes itself if `removeable="auto"` is set
5. Uses appropriate ARIA attributes for accessibility
6. Emits a `remove` event when the notification is dismissed

This creates a flexible notification system that can be used for various purposes throughout the application.
