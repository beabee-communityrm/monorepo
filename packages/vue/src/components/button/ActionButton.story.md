# ActionButton

The `ActionButton` component is a specialized button that extends `AppButton` with a predefined `primaryOutlined` variant. It's primarily used for action items in navigation menus, toolbars, or action panels.

## Usage Patterns

- **Callout actions** - View, Edit, Replicate, End Now, Reopen, Delete operations
- **Toolbar buttons** - Quick actions in admin interfaces
- **Menu items** - Action-oriented navigation elements

## Key Features

- ✅ **Always primaryOutlined** - Consistent styling across all instances
- ✅ **Icon required** - Every ActionButton must have an icon
- ✅ **Responsive behavior** - Left-aligned text on larger screens

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