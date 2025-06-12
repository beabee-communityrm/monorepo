# AppCopyButton

The `AppCopyButton` component provides a simple way to copy text to the clipboard with user feedback through notifications.

## Usage Patterns

- **Input fields** - Copy values from read-only inputs (API keys, URLs, codes)
- **Code blocks** - Copy code snippets or configuration values
- **Share links** - Copy URLs or sharing links
- **Reference data** - Copy IDs, tokens, or other reference information

## Key Features

- ✅ **Clipboard API** - Uses modern browser clipboard functionality
- ✅ **User feedback** - Success/error notifications with internationalization
- ✅ **Two variants** - Normal (for inputs) and float (for overlays)
- ✅ **Event emission** - Emits copy event for additional handling

## Usage

```vue
<AppCopyButton text="Text to copy" @copy="handleCopy" />
```

## Props

| Prop       | Type      | Required | Description                    |
| ---------- | --------- | -------- | ------------------------------ |
| `text`     | `string`  | Yes      | The text to copy to clipboard  |
| `variant`  |           | No       | A style variant                |
| `disabled` | `boolean` | No       | Whether the button is disabled |

## Events

| Event  | Description                              |
| ------ | ---------------------------------------- |
| `copy` | Emitted when text is successfully copied |

## How It Works

The AppCopyButton component:

1. Uses the Clipboard API to copy text to the clipboard
2. Shows a success notification when copying is successful
3. Shows an error notification if copying fails
4. Emits a `copy` event when copying is successful

This makes it easy to provide copy functionality throughout the application with consistent behavior and styling.
