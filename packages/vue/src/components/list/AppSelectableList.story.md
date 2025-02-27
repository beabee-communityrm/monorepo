# AppSelectableList

The `AppSelectableList` component displays a list of selectable items with visual feedback for the selected state. It's commonly used in dropdown menus for selecting one or more items from a list.

## Features

- Displays a list of selectable items
- Supports single or multiple selection
- Shows a checkmark icon for selected items
- Highlights selected items with a background color
- Supports disabled state
- Generic typing for item type

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

## Props

| Prop              | Type       | Default | Required | Description                                       |
| ----------------- | ---------- | ------- | -------- | ------------------------------------------------- |
| `items`           | `T[]`      | -       | Yes      | Array of items to display (must have id property) |
| `selectedItemIds` | `string[]` | `[]`    | No       | Array of selected item IDs                        |
| `disabled`        | `boolean`  | `false` | No       | Whether the list is disabled                      |

## Events

| Event   | Arguments                      | Description                                                                    |
| ------- | ------------------------------ | ------------------------------------------------------------------------------ |
| `click` | `(item: T, selected: boolean)` | Emitted when an item is clicked, with the item and its current selection state |

## Slots

| Slot    | Scope         | Description                       |
| ------- | ------------- | --------------------------------- |
| default | `{ item: T }` | Content for each item in the list |

## Examples

### Basic Usage

```vue
<script setup>
import { ref } from 'vue';

const users = [
  { id: '1', label: 'John Doe' },
  { id: '2', label: 'Jane Smith' },
  { id: '3', label: 'Alex Johnson' },
];

const selectedUserIds = ref([]);

function handleSelect(user, selected) {
  if (selected) {
    selectedUserIds.value = selectedUserIds.value.filter(
      (id) => id !== user.id
    );
  } else {
    selectedUserIds.value.push(user.id);
  }
}
</script>

<template>
  <AppSelectableList
    v-slot="{ item }"
    :items="users"
    :selected-item-ids="selectedUserIds"
    @click="handleSelect"
  >
    {{ item.label }}
  </AppSelectableList>
</template>
```

### With Icons

```vue
<AppSelectableList
  v-slot="{ item }"
  :items="tags"
  :selected-item-ids="selectedTagIds"
  @click="handleTagSelect"
>
  <div class="flex items-center">
    <font-awesome-icon :icon="faTag" class="mr-2" />
    {{ item.label }}
  </div>
</AppSelectableList>
```

### Single Selection

For single selection, you can manage the state to ensure only one item is selected:

```vue
<script setup>
const selectedLanguageId = ref('en');

function handleLanguageSelect(language, selected) {
  // For single selection, we replace the current selection
  selectedLanguageId.value = selected ? '' : language.id;
}
</script>

<template>
  <AppSelectableList
    v-slot="{ item }"
    :items="languages"
    :selected-item-ids="[selectedLanguageId]"
    @click="handleLanguageSelect"
  >
    <div class="flex items-center">
      <font-awesome-icon :icon="faGlobe" class="mr-2" />
      {{ item.label }}
    </div>
  </AppSelectableList>
</template>
```

### In a Dropdown

The component is commonly used inside dropdown menus:

```vue
<AppDropdownButton
  :icon="faUser"
  title="Assign To"
  variant="primaryOutlined"
  show-title
>
  <AppSelectableList
    v-slot="{ item }"
    :items="users"
    :selected-item-ids="selectedUserIds"
    @click="handleAssign"
  >
    {{ item.label }}
  </AppSelectableList>
</AppDropdownButton>
```

## How It Works

The AppSelectableList component:

1. Renders a list of items based on the provided `items` array
2. Tracks which items are selected based on the `selectedItemIds` prop
3. Applies styling to show selected state (background color and checkmark)
4. Emits a `click` event when an item is clicked, along with the item and its current selection state
5. The parent component is responsible for updating the selection state based on the click event

This pattern allows for flexible selection behavior (single, multiple, toggle, etc.) while keeping the component itself simple.
