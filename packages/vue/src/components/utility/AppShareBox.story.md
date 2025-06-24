# AppShareBox

A component for sharing URLs across various social media platforms and methods. Provides a collapsible box with social sharing options and a copy-to-clipboard feature.

## Features

- **Multiple social media sharing**: Facebook, LinkedIn, Telegram, Twitter, WhatsApp
- **Email sharing support**: Opens email client with pre-filled body
- **Copy-to-clipboard functionality**: Modern clipboard API with fallback support
- **Collapsible interface**: Uses AppExpandableBox for clean presentation
- **Full keyboard navigation**: Tab, Enter, and Space key support
- **Accessibility features**: ARIA labels, semantic HTML, screen reader support
- **Mobile-first responsive design**: Works well on all device sizes
- **Event system**: Emits success/error events for clipboard operations

## Props

| Prop           | Type     | Required | Default                        | Description                                       |
| -------------- | -------- | -------- | ------------------------------ | ------------------------------------------------- |
| `url`          | `string` | ✅       | -                              | The relative URL or path to be shared             |
| `baseUrl`      | `string` | ✅       | -                              | The base URL to prepend to the relative URL       |
| `shareText`    | `string` |          | `'Share'`                      | Text label for the share button                   |
| `copyText`     | `string` |          | `'Copy'`                       | Text label for the copy button                    |
| `addressText`  | `string` |          | `'Share this address:'`        | Text describing the address/URL section           |
| `servicesText` | `string` |          | `'Or share via social media:'` | Text describing the social media services section |
| `emailText`    | `string` |          | `'Email'`                      | Text label for the email sharing option           |

## Events

| Event       | Payload        | Description                                              |
| ----------- | -------------- | -------------------------------------------------------- |
| `copied`    | `url: string`  | Emitted when the URL is successfully copied to clipboard |
| `copyError` | `error: Error` | Emitted when copying to clipboard fails                  |

## Usage

### Basic Usage

```vue
<template>
  <AppShareBox
    url="/my-page"
    base-url="https://example.com"
    share-text="Share this page"
    copy-text="Copy link"
    address-text="Share this page using the address below:"
    services-text="Or share via social media:"
    email-text="Email"
  />
</template>
```

### With Event Handling

```vue
<template>
  <AppShareBox
    url="/blog/awesome-post"
    base-url="https://myblog.com"
    share-text="Share this post"
    copy-text="Copy post link"
    address-text="Share this blog post with your friends:"
    services-text="Spread the word on social media:"
    email-text="Email"
    @copied="handleCopySuccess"
    @copy-error="handleCopyError"
  />
</template>

<script setup>
function handleCopySuccess(url) {
  console.log('Successfully copied:', url);
  // Show success notification
}

function handleCopyError(error) {
  console.error('Copy failed:', error);
  // Show error notification
}
</script>
```

### Internationalization

```vue
<template>
  <AppShareBox
    url="/artikel/neuigkeiten"
    base-url="https://meine-website.de"
    :share-text="t('actions.share')"
    :copy-text="t('actions.copy')"
    :address-text="t('share.addressText')"
    :services-text="t('share.servicesText')"
    :email-text="t('share.email')"
  />
</template>
```
