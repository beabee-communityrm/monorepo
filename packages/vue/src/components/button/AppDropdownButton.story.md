# AppDropdownButton

The `AppDropdownButton` component provides a dropdown menu with customizable trigger button and menu items for user actions.

## Usage Patterns

- **Action menus** - Collections of related actions (Edit, Delete, Share, Export)
- **Context menus** - Right-click style menus with multiple options
- **Settings dropdowns** - Configuration options grouped in a menu
- **Navigation menus** - Secondary navigation with grouped links

## Key Features

- ✅ **Flexible trigger** - Any button variant can be used as the dropdown trigger
- ✅ **Custom menu items** - Support for links, actions, and dividers
- ✅ **Keyboard navigation** - Arrow keys and Tab support for accessibility
- ✅ **Outside click detection** - Automatically closes when clicking outside

## Usage

```vue
<AppDropdownButton
  :icon="faUser"
  title="Select User"
  variant="primaryOutlined"
  show-title
>
  <div class="p-2">
    <div class="hover:bg-grey-lighter cursor-pointer p-2">User 1</div>
    <div class="hover:bg-grey-lighter cursor-pointer p-2">User 2</div>
    <div class="hover:bg-grey-lighter cursor-pointer p-2">User 3</div>
  </div>
</AppDropdownButton>
```

## Real-world Examples

The AppDropdownButton is used in several places throughout the application:

1. **SetAssigneeButton** - For assigning users to callout responses
2. **MoveBucketButton** - For moving items between buckets
3. **ToggleTagButton** - For adding/removing tags
4. **CalloutMapHeader** - For language selection in callout views
