# AppInput

The `AppInput` component is a comprehensive wrapper around native HTML input elements that provides validation, error messages, help text, and additional functionality like copy buttons and prefix/suffix support.

## Features

- Support for multiple input types (text, email, password, number, url, date, time)
- Built-in validation with Vuelidate integration
- Error message display with AppInputError
- Help text display with AppInputHelp
- Prefix and suffix support
- Copy to clipboard functionality
- Proper focus states and accessibility
- Consistent styling across all input types
- Before and after slots for custom content

## Usage

```vue
<AppInput
  v-model="username"
  type="text"
  label="Username"
  name="username"
  required
  info-message="Choose a unique username"
/>
```

## Props

| Prop                 | Type                                                                       | Default     | Description                              |
| -------------------- | -------------------------------------------------------------------------- | ----------- | ---------------------------------------- |
| `modelValue`         | `string \| number`                                                         | `undefined` | The input value                          |
| `type`               | `'text' \| 'email' \| 'password' \| 'number' \| 'url' \| 'date' \| 'time'` | `'text'`    | The input type                           |
| `name`               | `string`                                                                   | `'unknown'` | The input name attribute                 |
| `label`              | `string`                                                                   | `undefined` | The input label                          |
| `infoMessage`        | `string`                                                                   | `undefined` | Help text to display                     |
| `required`           | `boolean`                                                                  | `false`     | Whether the input is required            |
| `disabled`           | `boolean`                                                                  | `false`     | Whether the input is disabled            |
| `min`                | `string \| number`                                                         | `undefined` | Minimum value/length                     |
| `max`                | `string \| number`                                                         | `undefined` | Maximum value/length                     |
| `sameAs`             | `string \| number`                                                         | `undefined` | Value to match (for confirmation fields) |
| `pattern`            | `string`                                                                   | `undefined` | Regex pattern for validation             |
| `hideErrorMessage`   | `boolean`                                                                  | `false`     | Whether to hide error messages           |
| `prefix`             | `string`                                                                   | `undefined` | Text to display before the input         |
| `suffix`             | `string`                                                                   | `undefined` | Text to display after the input          |
| `copyable`           | `boolean`                                                                  | `false`     | Whether to show copy button              |
| `copyButtonDisabled` | `boolean`                                                                  | `false`     | Whether copy button is disabled          |

## Events

| Event               | Description                           |
| ------------------- | ------------------------------------- |
| `update:modelValue` | Emitted when the input value changes  |
| `update:validation` | Emitted when validation state changes |

## Slots

| Slot     | Description                     |
| -------- | ------------------------------- |
| `before` | Content to display before input |
| `after`  | Content to display after input  |

## Examples

### Basic Text Input

```vue
<AppInput
  v-model="name"
  type="text"
  label="Full Name"
  name="fullName"
  required
  info-message="Enter your first and last name"
/>
```

### Email Input with Validation

```vue
<AppInput
  v-model="email"
  type="email"
  label="Email Address"
  name="email"
  required
  info-message="We'll use this for important updates"
/>
```

### Password Input

```vue
<AppInput
  v-model="password"
  type="password"
  label="Password"
  name="password"
  required
  info-message="Must be at least 8 characters with uppercase, lowercase, and numbers"
/>
```

### Number Input with Min/Max

```vue
<AppInput
  v-model="age"
  type="number"
  label="Age"
  name="age"
  :min="18"
  :max="120"
  info-message="Must be between 18 and 120"
/>
```

### Input with Prefix and Suffix

```vue
<AppInput
  v-model="amount"
  type="number"
  label="Amount"
  name="amount"
  prefix="$"
  suffix="USD"
  :min="0"
/>
```

### Copyable Input

```vue
<AppInput
  v-model="apiKey"
  type="text"
  label="API Key"
  name="apiKey"
  prefix="sk_"
  copyable
  info-message="Keep this secret and secure"
/>
```

### Input with Slots

```vue
<AppInput v-model="search" type="text" label="Search" name="search">
  <template #before>
    <SearchIcon class="w-4 h-4" />
  </template>
  <template #after>
    <button @click="clearSearch">Clear</button>
  </template>
</AppInput>
```

## Validation

The AppInput component includes built-in validation for different input types:

### Email Validation

```vue
<AppInput v-model="email" type="email" name="email" required />
<!-- Automatically validates email format -->
```

### Password Validation

```vue
<AppInput v-model="password" type="password" name="password" required />
<!-- Validates: 8+ chars, uppercase, lowercase, numbers -->
```

### Length Validation

```vue
<AppInput
  v-model="username"
  type="text"
  name="username"
  :min="3"
  :max="20"
  required
/>
<!-- Validates minimum and maximum length -->
```

### Pattern Validation

```vue
<AppInput
  v-model="phoneNumber"
  type="text"
  name="phone"
  pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
  info-message="Format: 555-123-4567"
/>
```

### Confirmation Fields

```vue
<AppInput v-model="password" type="password" name="password" />
<AppInput
  v-model="confirmPassword"
  type="password"
  name="confirmPassword"
  :same-as="password"
  label="Confirm Password"
/>
```

## Real-world Examples

### User Registration Form

```vue
<AppInput
  v-model="form.firstName"
  type="text"
  label="First Name"
  name="firstName"
  required
/>

<AppInput
  v-model="form.lastName"
  type="text"
  label="Last Name"
  name="lastName"
  required
/>

<AppInput
  v-model="form.email"
  type="email"
  label="Email"
  name="email"
  required
  info-message="We'll send a verification email here"
/>

<AppInput
  v-model="form.password"
  type="password"
  label="Password"
  name="password"
  required
/>
```

### Payment Form

```vue
<AppInput
  v-model="payment.amount"
  type="number"
  label="Amount"
  name="amount"
  prefix="$"
  suffix="USD"
  :min="1"
  required
/>

<AppInput
  v-model="payment.cardNumber"
  type="text"
  label="Card Number"
  name="cardNumber"
  pattern="[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}"
  info-message="Format: 1234-5678-9012-3456"
  required
/>
```

### API Configuration

```vue
<AppInput
  v-model="config.endpoint"
  type="url"
  label="API Endpoint"
  name="endpoint"
  prefix="https://"
  required
/>

<AppInput
  v-model="config.apiKey"
  type="text"
  label="API Key"
  name="apiKey"
  copyable
  info-message="Keep this secure"
/>
```

## How It Works

The AppInput component:

1. **Wraps native input elements** with consistent styling and behavior
2. **Provides automatic validation** using Vuelidate for different input types
3. **Displays error messages** using AppInputError when validation fails
4. **Shows help text** using AppInputHelp when provided
5. **Supports prefix/suffix** with proper visual styling and borders
6. **Includes copy functionality** with AppCopyButton integration
7. **Handles focus states** with shadow effects and proper visual feedback
8. **Maintains accessibility** with proper labels and ARIA attributes
9. **Emits validation events** to parent components for form management

This creates a comprehensive, reusable input component that handles most form input needs with consistent validation and styling.
