# AppShareBox

A component for sharing URLs across various social media platforms and methods. Provides a collapsible box with social sharing options and a copy-to-clipboard feature.

## Features

- **Multiple social media sharing**: Facebook, LinkedIn, Telegram, Twitter, WhatsApp
- **Email sharing support**: Opens email client with pre-filled body
- **Copy-to-clipboard functionality**: Uses AppInput with AppCopyButton for reliable copy behavior
- **Collapsible interface**: Uses AppExpandableBox for clean presentation
- **Full keyboard navigation**: Tab, Enter, and Space key support
- **Accessibility features**: ARIA labels, semantic HTML, screen reader support
- **Mobile-first responsive design**: Works well on all device sizes
- **Integrated notifications**: Copy success/error notifications handled automatically

## Props

| Prop  | Type     | Default    | Description               |
| ----- | -------- | ---------- | ------------------------- |
| `url` | `string` | _required_ | The full URL to be shared |

## Usage

### Basic Usage

```vue
<AppShareBox url="https://example.com/my-page" />
```

### Blog Post Example

```vue
<AppShareBox url="https://myblog.com/blog/awesome-article" />
```

### Event Sharing

```vue
<AppShareBox url="https://events.example.com/events/tech-conference-2024" />
```
