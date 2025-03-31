# AppDropdownButton

The `AppDropdownButton` component is a button that displays a dropdown menu when clicked. It's commonly used for actions that require selecting from a list of options.

## Features

- Displays a dropdown menu when clicked
- Can show or hide the button title
- Uses outlined button variants
- Automatically closes when clicking outside
- Supports disabled state
- Dropdown menu can contain any content

## Usage

```vue
<AppDropdownButton
  :icon="faUser"
  title="Select User"
  variant="primaryOutlined"
  show-title
>
  <div class="p-2">
    <div class="hover:bg-gray-100 cursor-pointer p-2">User 1</div>
    <div class="hover:bg-gray-100 cursor-pointer p-2">User 2</div>
    <div class="hover:bg-gray-100 cursor-pointer p-2">User 3</div>
  </div>
</AppDropdownButton>
```

## Props

| Prop        | Type             | Default | Required | Description                                                                                         |
| ----------- | ---------------- | ------- | -------- | --------------------------------------------------------------------------------------------------- |
| `icon`      | `IconDefinition` | -       | Yes      | FontAwesome icon to display in the button                                                           |
| `title`     | `string`         | -       | Yes      | Title text for the button (shown if showTitle is true, and used for the title attribute)            |
| `variant`   | `string`         | -       | Yes      | Button variant. Must be one of: `primaryOutlined`, `linkOutlined`, `dangerOutlined`, `greyOutlined` |
| `showTitle` | `boolean`        | `false` | No       | Whether to show the title text next to the icon                                                     |
| `disabled`  | `boolean`        | `false` | No       | Whether the button is disabled                                                                      |

## Slots

| Slot    | Description                   |
| ------- | ----------------------------- |
| default | Content for the dropdown menu |

## Examples

### Basic Usage

```vue
<AppDropdownButton
  :icon="faUser"
  title="Select User"
  variant="primaryOutlined"
  show-title
>
  <div class="p-2">
    <div class="hover:bg-gray-100 cursor-pointer p-2">User 1</div>
    <div class="hover:bg-gray-100 cursor-pointer p-2">User 2</div>
    <div class="hover:bg-gray-100 cursor-pointer p-2">User 3</div>
  </div>
</AppDropdownButton>
```

### Icon Only

```vue
<AppDropdownButton :icon="faUser" title="Select User" variant="primaryOutlined">
  <div class="p-2">
    <div class="hover:bg-gray-100 cursor-pointer p-2">User 1</div>
    <div class="hover:bg-gray-100 cursor-pointer p-2">User 2</div>
    <div class="hover:bg-gray-100 cursor-pointer p-2">User 3</div>
  </div>
</AppDropdownButton>
```

### With AppSelectableList

The dropdown button is often used with the AppSelectableList component:

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

### Tag Selection Example

```vue
<AppDropdownButton
  :icon="faTag"
  title="Toggle Tags"
  variant="primaryOutlined"
  show-title
>
  <AppSelectableList
    v-slot="{ item }"
    :items="tagItems"
    :selected-item-ids="selectedTags"
    @click="handleToggle"
  >
    <font-awesome-icon class="mr-2" :icon="faTag" />{{ item.label }}
  </AppSelectableList>
  
  <router-link
    class="block border-t border-primary-40 px-3 py-2 font-semibold text-primary underline hover:bg-primary-5"
    :to="manageTagsUrl"
  >
    <font-awesome-icon class="mr-2" :icon="faCog" />Manage Tags
  </router-link>
</AppDropdownButton>
```

### Language Selection Example

```vue
<AppDropdownButton
  :icon="faGlobe"
  title="English"
  variant="greyOutlined"
  show-title
>
  <AppSelectableList
    v-slot="{ item }"
    :items="languages"
    @click="selectLanguage"
  >
    <font-awesome-icon :icon="faGlobe" class="mr-2" />{{ item.label }}
  </AppSelectableList>
</AppDropdownButton>
```

## Real-world Examples

The AppDropdownButton is used in several places throughout the application:

1. **SetAssigneeButton** - For assigning users to callout responses
2. **MoveBucketButton** - For moving items between buckets
3. **ToggleTagButton** - For adding/removing tags
4. **CalloutMapHeader** - For language selection in callout views
