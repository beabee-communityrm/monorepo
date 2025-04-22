# AppFormBox

The `AppFormBox` component is a container for grouping related form fields. It provides a consistent visual structure with optional title, help text, and notification.

## Features

- Groups related form fields in a visually distinct container
- Optional title for the form section
- Optional help text with HTML support
- Optional notification for important information
- Consistent styling and spacing

## Usage

```vue
<AppFormBox title="Personal Information">
  <AppFormField>
    <AppLabel label="Full Name" required />
    <AppInput v-model="fullName" />
  </AppFormField>
  
  <AppFormField>
    <AppLabel label="Email" required />
    <AppInput v-model="email" type="email" />
  </AppFormField>
</AppFormBox>
```

## Props

| Prop           | Type                   | Default     | Description                                      |
| -------------- | ---------------------- | ----------- | ------------------------------------------------ |
| `title`        | `string`               | `undefined` | Optional title for the form box                  |
| `help`         | `string`               | `undefined` | Optional help text displayed above the form box  |
| `notification` | `AppNotificationProps` | `undefined` | Optional notification to display in the form box |

## Examples

### Basic Usage

```vue
<AppFormBox title="Account Settings">
  <AppFormField>
    <AppLabel label="Username" />
    <AppInput v-model="username" />
  </AppFormField>
</AppFormBox>
```

### With Help Text

```vue
<AppFormBox
  title="Privacy Settings"
  help="These settings control who can see your information."
>
  <AppFormField>
    <AppToggleField
      v-model="publicProfile"
      label="Public Profile"
      description="Allow others to see your profile"
    />
  </AppFormField>
</AppFormBox>
```

### With Notification

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
  <AppFormField>
    <AppLabel label="Delete Account" />
    <button type="button" class="btn btn-danger">
      Delete My Account
    </button>
  </AppFormField>
</AppFormBox>
```

### Multiple Form Boxes in a Form

```vue
<AppForm @submit="handleSubmit">
  <AppFormBox title="Personal Information">
    <AppFormField>
      <AppLabel label="Full Name" required />
      <AppInput v-model="fullName" required />
    </AppFormField>
  </AppFormBox>

  <AppFormBox title="Contact Information">
    <AppFormField>
      <AppLabel label="Email" required />
      <AppInput v-model="email" type="email" required />
    </AppFormField>
    
    <AppFormField>
      <AppLabel label="Phone" />
      <AppInput v-model="phone" type="tel" />
    </AppFormField>
  </AppFormBox>
  
  <AppFormBox title="Preferences">
    <AppFormField>
      <AppToggleField
        v-model="receiveEmails"
        label="Email Notifications"
        description="Receive updates via email"
      />
    </AppFormField>
  </AppFormBox>
</AppForm>
```

## How It Works

The AppFormBox component:

1. Creates a container with consistent spacing and styling
2. Optionally displays a title at the top of the box
3. Optionally displays help text above the title
4. Optionally displays a notification below the title
5. Renders the form fields passed via the default slot
6. Provides visual separation between different sections of a form

This creates a structured and organized form layout that improves usability and readability.
