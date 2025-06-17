# AppRichTextEditorButton

A specialized button component designed for rich text editor toolbars. It provides visual feedback for active/inactive states and integrates seamlessly with TipTap editor commands.

## Features

- **Active/Inactive States**: Visual distinction between applied and unapplied formatting
- **Icon Support**: Displays FontAwesome icons for intuitive formatting controls
- **Accessibility**: ARIA attributes for screen readers and keyboard navigation
- **Touch-Friendly**: Optimized for mobile interaction with proper sizing
- **Disabled State**: Prevents interaction when the editor is disabled

## Usage

```vue
<template>
  <AppRichTextEditorButton
    :icon="faBold"
    title="Bold"
    :active="editor.isActive('bold')"
    :disabled="false"
    @click="editor.chain().focus().toggleBold().run()"
  />
</template>
```

## Props

| Prop       | Type             | Default     | Description                                        |
| ---------- | ---------------- | ----------- | -------------------------------------------------- |
| `active`   | `boolean`        | -           | Whether the formatting command is currently active |
| `disabled` | `boolean`        | `false`     | Whether the button is disabled                     |
| `icon`     | `IconDefinition` | `undefined` | FontAwesome icon to display                        |
| `title`    | `string`         | `undefined` | Accessible title/tooltip text                      |

## Events

| Event   | Payload | Description                        |
| ------- | ------- | ---------------------------------- |
| `click` | `Event` | Emitted when the button is clicked |

## Accessibility

- Uses `aria-pressed` to indicate active state for screen readers
- Provides `aria-label` for accessible button labeling
- Maintains proper focus management and keyboard navigation
- Icons are marked with `aria-hidden="true"` to avoid redundant announcements
