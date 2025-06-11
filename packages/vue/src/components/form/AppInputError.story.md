# AppInputError

The `AppInputError` component displays error messages for form inputs with consistent danger styling. It's designed to provide clear, accessible error feedback to users when form validation fails.

## Features

- Consistent danger/error styling with red text color
- Accessible with proper ARIA `role="alert"` attribute
- Small, semi-bold text for clear error visibility
- Support for both string and reactive string values
- Proper spacing with margin-top for positioning below inputs

## Usage

```vue
<AppInputError message="This field is required" />
```

## Props

| Prop      | Type                    | Default | Description                  |
| --------- | ----------------------- | ------- | ---------------------------- |
| `message` | `string \| Ref<string>` | -       | The error message to display |

## Examples

### Basic Usage

```vue
<AppInputError message="This field is required" />
```

### With Reactive Message

```vue
<script setup>
import { ref } from 'vue';

const errorMessage = ref('Email is invalid');
</script>

<template>
  <AppInputError :message="errorMessage" />
</template>
```

### Common Error Messages

```vue
<!-- Required field error -->
<AppInputError message="This field is required" />

<!-- Email validation error -->
<AppInputError message="Please enter a valid email address" />

<!-- Password validation error -->
<AppInputError
  message="Password must be at least 8 characters long and contain uppercase, lowercase, and numbers"
/>

<!-- Length validation error -->
<AppInputError message="Minimum length is 3 characters" />
```

## Real-world Examples

The AppInputError is commonly used with form validation:

1. **Form Validation with Vuelidate**

```vue
<template>
  <AppInput v-model="email" type="email" label="Email" />
  <AppInputError
    v-if="validation.email.$error"
    :message="validation.email.$errors[0].$message"
  />
</template>
```

2. **Custom Validation Logic**

```vue
<script setup>
import { computed } from 'vue';

const email = ref('');
const errorMessage = computed(() => {
  if (!email.value) return 'Email is required';
  if (!email.value.includes('@')) return 'Please enter a valid email';
  return '';
});
</script>

<template>
  <AppInput v-model="email" type="email" label="Email" />
  <AppInputError v-if="errorMessage" :message="errorMessage" />
</template>
```

## How It Works

The AppInputError component:

1. Displays text in a danger/red color for clear error indication
2. Uses `role="alert"` for accessibility and screen reader support
3. Has consistent spacing (mt-1.5) to position properly below form inputs
4. Uses small (text-xs) and semi-bold font weight for readability
5. Accepts both static strings and reactive Vue refs for dynamic error messages

This creates a consistent, accessible way to display validation errors throughout the application.
