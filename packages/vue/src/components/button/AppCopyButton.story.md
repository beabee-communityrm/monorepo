# AppCopyButton

The `AppCopyButton` component provides a simple way to copy text to the clipboard. It displays a copy icon button that, when clicked, copies the provided text and shows a success notification.

## Features

- Copies text to clipboard with a single click
- Shows success notification when copying is successful
- Shows error notification if copying fails
- Emits an event when copying is successful
- Designed to be used within input fields or other UI elements

## Usage

```vue
<AppCopyButton text="Text to copy" @copy="handleCopy" />
```

## Props

| Prop   | Type     | Required | Description                   |
| ------ | -------- | -------- | ----------------------------- |
| `text` | `string` | Yes      | The text to copy to clipboard |

## Events

| Event  | Description                              |
| ------ | ---------------------------------------- |
| `copy` | Emitted when text is successfully copied |

## Examples

### Basic Usage

```vue
<AppCopyButton text="Copy this text" @copy="handleCopy" />
```

### In an Input Field

```vue
<div class="flex items-center border rounded">
  <input
    v-model="value"
    class="flex-1 px-2 py-2 border-none focus:outline-none"
    type="text"
  />
  <div class="h-10 border-l border-primary-40">
    <AppCopyButton :text="value" />
  </div>
</div>
```

### With Prefix

```vue
<div class="flex items-center border rounded">
  <span class="flex-0 border-r border-primary-40 bg-grey-lighter px-2 py-2">
    https://
  </span>
  <input
    v-model="domain"
    class="flex-1 px-2 py-2 border-none focus:outline-none"
    type="text"
  />
  <div class="h-10 border-l border-primary-40">
    <AppCopyButton :text="`https://${domain}`" />
  </div>
</div>
```

### In a Form Component

The AppCopyButton is commonly used in the AppInput component:

```vue
<AppInput
  v-model="apiKey"
  label="API Key"
  copyable
/>
```

## How It Works

The AppCopyButton component:

1. Uses the Clipboard API to copy text to the clipboard
2. Shows a success notification when copying is successful
3. Shows an error notification if copying fails
4. Emits a `copy` event when copying is successful

This makes it easy to provide copy functionality throughout the application with consistent behavior and styling. 
