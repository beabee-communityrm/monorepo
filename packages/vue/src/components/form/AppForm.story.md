# AppForm

The `AppForm` component provides a standardized form container with built-in error handling, validation, loading states, and consistent button styling.

## Usage Patterns

- **Authentication forms** - Sign in, sign up, password reset flows
- **Content management** - Create, edit, and update operations
- **Settings forms** - User preferences and configuration options
- **Multi-step forms** - Combined with form boxes for structured layouts

## Key Features

- ✅ **Built-in error handling** - Automatic API error management with notifications
- ✅ **Loading state management** - Disables form during submission with visual feedback
- ✅ **Success notifications** - Configurable success messages after submission
- ✅ **Validation integration** - Works with Vuelidate for client-side validation

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
