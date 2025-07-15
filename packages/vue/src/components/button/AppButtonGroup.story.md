# AppButtonGroup

The `AppButtonGroup` component groups multiple `AppButton` components together with connected styling, creating a cohesive button group or toolbar.

## Usage Patterns

- **Toolbars** - Collections of related actions (New, Edit, Download, Delete)
- **View toggles** - Switch between different display modes (List, Grid, Card)
- **Filter groups** - Related filtering options
- **Action groups** - Sets of related operations

## Key Features

- ✅ **Connected styling** - Removes borders between buttons and rounds outer corners only
- ✅ **Semantic grouping** - Uses `role="group"` for accessibility
- ✅ **Focus management** - Proper keyboard navigation within the group

## Usage

```vue
<AppButtonGroup>
  <AppButton variant="primaryOutlined">Left</AppButton>
  <AppButton variant="primaryOutlined">Middle</AppButton>
  <AppButton variant="primaryOutlined">Right</AppButton>
</AppButtonGroup>
```

## Slots

| Slot    | Description                                              |
| ------- | -------------------------------------------------------- |
| default | Place AppButton components here to create a button group |

## How It Works

The AppButtonGroup component applies special styling to its children through CSS classes. It uses the `group/btns` class to target child buttons and applies the following styles:

- Removes border radius except for the first and last buttons
- Adds negative margin to overlap borders
- Ensures proper z-index on hover

This creates a connected appearance while maintaining the interactive behavior of each button.
