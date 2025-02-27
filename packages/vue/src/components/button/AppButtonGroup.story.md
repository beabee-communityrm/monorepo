# AppButtonGroup

The `AppButtonGroup` component is a container for grouping multiple `AppButton` components together with connected styling, creating a cohesive button group or toolbar.

## Features

- Groups buttons together with connected styling
- Removes spacing between buttons
- Rounds only the outer corners of the button group
- Works with any variant of AppButton
- Can be used with ActionButton components as well

## Usage

```vue
<AppButtonGroup>
  <AppButton variant="primaryOutlined">Left</AppButton>
  <AppButton variant="primaryOutlined">Middle</AppButton>
  <AppButton variant="primaryOutlined">Right</AppButton>
</AppButtonGroup>
```

## Slots

| Slot    | Description                                              |
| ------- | -------------------------------------------------------- |
| default | Place AppButton components here to create a button group |

## Examples

### Basic Button Group

Create a simple group of connected buttons:

```vue
<AppButtonGroup>
  <AppButton variant="primaryOutlined">Button 1</AppButton>
  <AppButton variant="primaryOutlined">Button 2</AppButton>
  <AppButton variant="primaryOutlined">Button 3</AppButton>
</AppButtonGroup>
```

### With Icons

Button groups work well with icons:

```vue
<AppButtonGroup>
  <AppButton variant="primaryOutlined" :icon="faUser">User 1</AppButton>
  <AppButton variant="primaryOutlined" :icon="faUser">User 2</AppButton>
  <AppButton variant="primaryOutlined" :icon="faUser">User 3</AppButton>
</AppButtonGroup>
```

### Different Variants

You can use any button variant in a button group:

```vue
<AppButtonGroup>
  <AppButton variant="primary">Left</AppButton>
  <AppButton variant="primary">Middle</AppButton>
  <AppButton variant="primary">Right</AppButton>
</AppButtonGroup>
```

### Toolbar Example

Create a toolbar with different button types:

```vue
<AppButtonGroup>
  <AppButton variant="primary" :icon="faPlus">New</AppButton>
  <AppButton variant="primaryOutlined" :icon="faEdit">Edit</AppButton>
  <AppButton variant="primaryOutlined" :icon="faDownload">Download</AppButton>
  <AppButton variant="primaryOutlined" :icon="faUpload">Upload</AppButton>
  <AppButton variant="danger" :icon="faTrash">Delete</AppButton>
</AppButtonGroup>
```

### With Action Buttons

You can also use ActionButton components in a button group:

```vue
<AppButtonGroup>
  <ActionButton :icon="faEdit">Edit</ActionButton>
  <ActionButton :icon="faTrash">Delete</ActionButton>
  <ActionButton :icon="faPlus">Add</ActionButton>
</AppButtonGroup>
```

## How It Works

The AppButtonGroup component applies special styling to its children through CSS classes. It uses the `group/btns` class to target child buttons and applies the following styles:

- Removes border radius except for the first and last buttons
- Adds negative margin to overlap borders
- Ensures proper z-index on hover

This creates a connected appearance while maintaining the interactive behavior of each button.
