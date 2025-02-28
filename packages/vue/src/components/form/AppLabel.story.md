# AppLabel

The `AppLabel` component provides a consistent label for form fields. It's a simple component that displays a label with an optional required indicator.

## Features

- Consistent styling for form labels
- Optional required indicator (asterisk)
- Semantic HTML using the `<label>` element

## Usage

```vue
<AppLabel label="First Name" required />
```

## Props

| Prop       | Type      | Default | Description                                 |
| ---------- | --------- | ------- | ------------------------------------------- |
| `label`    | `string`  | -       | The text to display as the label (required) |
| `required` | `boolean` | `false` | Whether to show the required indicator (\*) |

## Examples

### Basic Usage

```vue
<AppLabel label="First Name" />
```

### Required Field

```vue
<AppLabel label="First Name" required />
```

### In a Form

```vue
<div>
  <AppLabel label="First Name" required />
  <AppInput v-model="firstName" name="firstName" required />
</div>

<div>
  <AppLabel label="Last Name" />
  <AppInput v-model="lastName" name="lastName" />
</div>
```

## How It Works

The AppLabel component:

1. Renders a semantic HTML `<label>` element
2. Displays the provided label text
3. Adds an asterisk (\*) if the field is required
4. Applies consistent styling with proper spacing and font weight

This creates a simple but consistent label component that can be used throughout the application's forms.
