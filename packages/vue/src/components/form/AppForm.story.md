# AppForm

The `AppForm` component provides a standardized form container with built-in error handling, validation, loading states, and consistent button styling. It's designed to simplify form creation and provide a consistent user experience across the application.

## Features

- Consistent form submission handling
- Built-in loading state during form submission
- Error handling with customizable error messages
- Support for validation
- Configurable submit and reset buttons
- Success notifications after successful submission
- Inline or toast error notifications

## Usage

```vue
<AppForm
  button-text="Sign In"
  success-text="You have been signed in successfully!"
  :on-submit="handleSignIn"
>
  <AppFormField>
    <AppLabel label="Email" required />
    <AppInput v-model="email" type="email" required />
  </AppFormField>
  
  <AppFormField>
    <AppLabel label="Password" required />
    <AppInput v-model="password" type="password" required />
  </AppFormField>
</AppForm>
```

## Props

| Prop              | Type                     | Default | Description                                        |
| ----------------- | ------------------------ | ------- | -------------------------------------------------- |
| `buttonText`      | `string`                 | -       | Text for the submit button (required)              |
| `resetButtonText` | `string`                 | -       | Text for the reset button (optional)               |
| `successText`     | `string`                 | -       | Text for success notification after submission     |
| `errorText`       | `Record<string, string>` | -       | Custom error messages for specific error codes     |
| `inlineError`     | `boolean`                | `false` | Whether to show errors inline instead of as toasts |
| `fullButton`      | `boolean`                | `false` | Whether the submit button should be full width     |
| `onSubmit`        | `Function`               | -       | Function to call when the form is submitted        |

## Events

| Event   | Description                              |
| ------- | ---------------------------------------- |
| `reset` | Emitted when the reset button is clicked |

## Examples

### Basic Form

```vue
<AppForm button-text="Sign In" :on-submit="handleSignIn">
  <AppFormField>
    <AppLabel label="Email" required />
    <AppInput v-model="email" type="email" required />
  </AppFormField>
  
  <AppFormField>
    <AppLabel label="Password" required />
    <AppInput v-model="password" type="password" required />
  </AppFormField>
</AppForm>
```

### With Reset Button

```vue
<AppForm
  button-text="Save Changes"
  reset-button-text="Cancel"
  :on-submit="saveProfile"
  @reset="resetForm"
>
  <AppFormField>
    <AppLabel label="Display Name" />
    <AppInput v-model="displayName" />
  </AppFormField>
  
  <AppFormField>
    <AppLabel label="Bio" />
    <AppTextarea v-model="bio" rows="3" />
  </AppFormField>
</AppForm>
```

### With Success Notification

```vue
<AppForm
  button-text="Create Account"
  success-text="Your account has been created successfully!"
  :on-submit="createAccount"
>
  <!-- Form fields -->
</AppForm>
```

### With Custom Error Messages

```vue
<AppForm
  button-text="Sign Up"
  :error-text="{
    'duplicate-email': 'This email is already registered.',
    'invalid-password': 'Password must be at least 8 characters long.',
  }"
  :on-submit="signUp"
>
  <!-- Form fields -->
</AppForm>
```

### With Inline Error

```vue
<AppForm button-text="Submit" :inline-error="true" :on-submit="submitForm">
  <!-- Form fields -->
</AppForm>
```

### With Full Width Button

```vue
<AppForm button-text="Sign Up" :full-button="true" :on-submit="signUp">
  <!-- Form fields -->
</AppForm>
```

### With Form Boxes

```vue
<AppForm button-text="Create Account" :on-submit="createAccount">
  <AppFormBox title="Personal Information">
    <AppFormField>
      <AppLabel label="Full Name" required />
      <AppInput v-model="fullName" required />
    </AppFormField>
    
    <AppFormField>
      <AppLabel label="Email" required />
      <AppInput v-model="email" type="email" required />
    </AppFormField>
  </AppFormBox>
  
  <AppFormBox title="Account Security">
    <AppFormField help="Choose a strong password with at least 8 characters.">
      <AppLabel label="Password" required />
      <AppInput v-model="password" type="password" required />
    </AppFormField>
    
    <AppFormField>
      <AppLabel label="Confirm Password" required />
      <AppInput v-model="confirmPassword" type="password" required />
    </AppFormField>
  </AppFormBox>
</AppForm>
```

## How It Works

The AppForm component:

1. Wraps form elements in a `<form>` element with proper event handling
2. Handles form submission with loading state
3. Displays validation errors when fields are invalid
4. Shows success notifications after successful submission
5. Displays error notifications when submission fails
6. Provides consistent button styling and layout
7. Supports form reset functionality

This creates a consistent and user-friendly form experience throughout the application.
