# AppFormField

The `AppFormField` component is a container for form fields that provides consistent spacing and optional help text. It's designed to wrap form inputs and their labels to create a cohesive form layout.

## Features

- Consistent spacing between form fields
- Optional help text with HTML support
- Simple and flexible container for any form elements

## Usage

```vue
<AppFormField help="This is help text for the field.">
  <AppLabel label="Field Label" />
  <AppInput v-model="fieldValue" />
</AppFormField>
```

## Props

| Prop   | Type     | Default     | Description                                   |
| ------ | -------- | ----------- | --------------------------------------------- |
| `help` | `string` | `undefined` | Optional help text to display below the field |

## Examples

### Basic Usage

```vue
<AppFormField>
  <AppLabel label="Username" />
  <AppInput v-model="username" />
</AppFormField>
```

### With Help Text

```vue
<AppFormField help="Choose a username that is at least 3 characters long.">
  <AppLabel label="Username" />
  <AppInput v-model="username" />
</AppFormField>
```

### With HTML in Help Text

```vue
<AppFormField help="Read our <a href='/privacy' class='text-link'>privacy policy</a> for more information.">
  <AppLabel label="Email" />
  <AppInput v-model="email" type="email" />
</AppFormField>
```

### In a Form

```vue
<AppForm @submit="handleSubmit">
  <AppFormField help="Enter your full name as it appears on your ID.">
    <AppLabel label="Full Name" required />
    <AppInput v-model="fullName" required />
  </AppFormField>

  <AppFormField help="We'll use this email to contact you.">
    <AppLabel label="Email Address" required />
    <AppInput v-model="email" type="email" required />
  </AppFormField>

  <AppFormField>
    <AppLabel label="Phone Number" />
    <AppInput v-model="phone" type="tel" />
  </AppFormField>
</AppForm>
```

## How It Works

The AppFormField component:

1. Wraps form elements in a container with consistent spacing
2. Renders any content passed via the default slot (typically a label and input)
3. Optionally displays help text below the form elements
4. Applies proper spacing between consecutive form fields
5. Supports HTML in the help text for rich formatting and links

This creates a consistent and accessible form layout that can be used throughout the application. 
