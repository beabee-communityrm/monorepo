# AppSelectableList

The `AppSelectableList` component provides a list interface with item selection capabilities, including single and multi-select modes.

## Usage Patterns

- **Data selection** - Choose items from lists of users, files, or records
- **Bulk operations** - Select multiple items for batch actions
- **Permission management** - Select users or groups for access control
- **Content management** - Choose items for publishing, deletion, or editing

## Key Features

- ✅ **Multiple selection modes** - Single, multiple, and mixed selection support
- ✅ **Keyboard navigation** - Arrow keys and spacebar for accessibility
- ✅ **Visual feedback** - Clear selection states and hover effects
- ✅ **Flexible content** - Custom item rendering with slots

## Usage

```vue
<AppSelectableList
  v-slot="{ item }"
  :items="users"
  :selected-item-ids="selectedUserIds"
  @click="handleSelect"
>
  {{ item.label }}
</AppSelectableList>
```
