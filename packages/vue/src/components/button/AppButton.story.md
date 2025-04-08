# AppButton

The `AppButton` component is a versatile button component that can be rendered as a button, link, or router-link with various styles and states.

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

## Props

| Prop       | Type               | Default     | Description                                                                                                                                                                |
| ---------- | ------------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `variant`  | `string`           | `'primary'` | Visual style of the button. Options: `primary`, `link`, `danger`, `primaryOutlined`, `linkOutlined`, `dangerOutlined`, `dangerGhost`, `greyOutlined`, `text`, `dangerText` |
| `size`     | `string`           | `'md'`      | Size of the button. Options: `xs`, `sm`, `md`, `lg`                                                                                                                        |
| `disabled` | `boolean`          | `false`     | Whether the button is disabled                                                                                                                                             |
| `loading`  | `boolean`          | `false`     | Whether to show a loading spinner                                                                                                                                          |
| `type`     | `string`           | `'button'`  | HTML button type attribute. Options: `button`, `submit`                                                                                                                    |
| `href`     | `string`           | `undefined` | URL for anchor tag. If provided, renders as `<a>`                                                                                                                          |
| `external` | `boolean`          | `false`     | Whether the link opens in a new tab (adds `target="_blank"` and `rel="noopener noreferrer"`)                                                                               |
| `to`       | `RouteLocationRaw` | `undefined` | Vue Router destination. If provided, renders as `<router-link>`                                                                                                            |
| `icon`     | `IconDefinition`   | `undefined` | FontAwesome icon to display before the button text                                                                                                                         |
| `is`       | `string`           | `'button'`  | Component to render as. Options: `button`, `label`                                                                                                                         |

## Slots

| Slot    | Description                            |
| ------- | -------------------------------------- |
| default | Button content                         |
| after   | Content to place after the button text |

## Examples

### Basic Variants

The button comes in several variants to match different UI needs:

- `primary`: Main call-to-action buttons
- `link`: Secondary actions with link styling
- `danger`: Destructive actions
- `primaryOutlined`, `linkOutlined`, `dangerOutlined`, `greyOutlined`: Outlined versions with transparent background
- `dangerGhost`: Ghost button for dangerous actions with minimal visual impact
- `text`, `dangerText`: Text-only buttons with underline

### With Icons

Icons can be added to any button variant:

```vue
<AppButton :icon="faUser">User Profile</AppButton>
```

### Loading State

Show a loading spinner when an action is in progress:

```vue
<AppButton :loading="isSubmitting">
  Save Changes
</AppButton>
```

### As Links

The button can be rendered as different elements:

```vue
<!-- External link -->
<AppButton href="https://example.com" external>
  Visit Website
</AppButton>

<!-- Router link -->
<AppButton :to="{ name: 'dashboard' }">
  Go to Dashboard
</AppButton>
```

### In Button Groups

The component has special styling when used in button groups:

```vue
<div class="group/btns flex">
  <AppButton>First</AppButton>
  <AppButton>Middle</AppButton>
  <AppButton>Last</AppButton>
</div>
```
