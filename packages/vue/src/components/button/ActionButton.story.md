# ActionButton

The `ActionButton` component is a specialized button that extends the base `AppButton` component with a predefined style. It's primarily used for action items in navigation menus, toolbars, or action panels.

## Features

- Always uses the `primaryOutlined` variant from AppButton
- Requires an icon to be provided
- Responsive behavior with left-aligned text on larger screens
- Simplified API compared to AppButton

## Usage

```vue
<ActionButton :icon="faEdit">
  Edit Item
</ActionButton>

<ActionButton :icon="faTrash">
  Delete
</ActionButton>

<ActionButton :icon="faPlus">
  Add New
</ActionButton>
```

## Props

| Prop   | Type             | Required | Description                               |
| ------ | ---------------- | -------- | ----------------------------------------- |
| `icon` | `IconDefinition` | Yes      | FontAwesome icon to display in the button |

## Slots

| Slot    | Description    |
| ------- | -------------- |
| default | Button content |

## Examples

### Callout Actions

ActionButton is commonly used for callout management actions:

```vue
<ActionButton :icon="faEye">View</ActionButton>
<ActionButton :icon="faPencilAlt">Edit</ActionButton>
<ActionButton :icon="faClone">Replicate</ActionButton>
<ActionButton :icon="faHourglassEnd">End Now</ActionButton>
<ActionButton :icon="faHourglassStart">Reopen</ActionButton>
<ActionButton :icon="faTrash">Delete</ActionButton>
```
