# AppButton

The `AppButton` component is a versatile button that can be rendered as a button, link, or router-link with various styles and states.

## Usage Patterns

- **Primary actions** - Main call-to-action buttons with `primary` variant
- **Secondary actions** - Supporting actions with `primaryOutlined` or `greyOutlined` variants
- **Destructive actions** - Delete or dangerous operations with `danger` variant
- **Navigation** - Links and router navigation with `link` variant
- **Text actions** - Minimal styling with `text` variants

## Button Groups

Special styling when used in button groups with the `group/btns` wrapper:

```vue
<div class="group/btns flex">
  <AppButton>First</AppButton>
  <AppButton>Middle</AppButton>
  <AppButton>Last</AppButton>
</div>
```

## Features

- Multiple visual variants (primary, link, danger, outlined versions, etc.)
- Different sizes (xs, sm, md, lg)
- Support for icons
- Loading state with spinner
- Can be rendered as a button, anchor, or router-link
- Disabled state
- External link support

## Usage

```vue
<AppButton>Default Button</AppButton>

<AppButton variant="danger">Danger Button</AppButton>

<AppButton variant="primaryOutlined" size="lg" :icon="faUser">
  Large Outlined Button with Icon
</AppButton>

<AppButton href="https://example.com" external>
  External Link
</AppButton>

<AppButton to="/dashboard">
  Router Link
</AppButton>

<AppButton loading>
  Loading Button
</AppButton>
```
