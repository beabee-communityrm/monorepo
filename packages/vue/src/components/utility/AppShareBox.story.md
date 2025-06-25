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

| Prop           | Type     | Default                        | Description                                 |
| -------------- | -------- | ------------------------------ | ------------------------------------------- |
| `url`          | `string` | _required_                     | The relative URL or path to be shared       |
| `baseUrl`      | `string` | _required_                     | The base URL to prepend to the relative URL |
| `shareText`    | `string` | `'Share'`                      | Text label for the main share button        |
| `copyText`     | `string` | `'Copy'`                       | Text label for the copy button              |
| `addressText`  | `string` | `'Share this address:'`        | Text describing the URL section             |
| `servicesText` | `string` | `'Or share via social media:'` | Text describing the social media section    |
| `emailText`    | `string` | `'Email'`                      | Text label for the email sharing option     |

## Usage

### Basic Usage

```vue
<AppShareBox
  url="/my-page"
  base-url="https://example.com"
  share-text="Share this page"
  copy-text="Copy link"
  address-text="Share this page using the address below:"
  services-text="Or share via social media:"
  email-text="Email"
/>
```

### Blog Post Example

```vue
<AppShareBox
  url="/blog/awesome-article"
  base-url="https://myblog.com"
  share-text="Share this article"
  copy-text="Copy article link"
  address-text="Share this blog post with your friends:"
  services-text="Spread the word on social media:"
  email-text="Email article"
/>
```

### Event Sharing

```vue
<AppShareBox
  url="/events/tech-conference-2024"
  base-url="https://events.example.com"
  share-text="Share this event"
  copy-text="Copy event link"
  address-text="Help us spread the word about this event:"
  services-text="Share on your favorite platform:"
  email-text="Email invitation"
/>
```
