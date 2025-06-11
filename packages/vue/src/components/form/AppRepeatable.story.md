# AppRepeatable

A generic, reusable component for managing dynamic lists of items with add/remove functionality. Provides a clean interface for building forms where users need to manage multiple entries of the same type.

## Use Cases

### Newsletter Opt-in Settings

Used in `NewsletterOptInSettings` to manage multiple newsletter subscription options.

```vue
<AppRepeatable
  v-model="newsletters"
  :new-item="() => ({ name: '', description: '', defaultOptIn: false })"
  add-label="Add Newsletter"
>
  <template #default="{ item }">
    <AppInput v-model="item.name" label="Newsletter Name" />
    <AppInput v-model="item.description" label="Description" />
  </template>
</AppRepeatable>
```

### Link List Management

Base component for `AppLinkList`, managing arrays of link objects.

```vue
<AppRepeatable
  v-model="links"
  :new-item="() => ({ text: '', url: '' })"
  add-label="Add Link"
>
  <template #default="{ item }">
    <AppInput v-model="item.text" label="Text" />
    <AppInput v-model="item.url" label="URL" />
  </template>
</AppRepeatable>
```

## Features

- **Generic Type Support**: Fully typed with TypeScript generics for type safety
- **Flexible Content**: Uses slots to define custom content for each item
- **Auto-binding**: Automatically binds v-model to manage the array
- **Clean UI**: Consistent styling with remove buttons and add functionality
- **Factory Pattern**: Uses a factory function to create new items

## Props

### Required Props

- `newItem`: Function that returns a new item of type T
- `addLabel`: Text for the "Add" button

### Optional Props

- `modelValue`: Array of items (used with v-model)

## Generic Type

The component is generic and works with any type:

```typescript
<AppRepeatable<TodoItem>
  v-model="todos"
  :new-item="() => ({ task: '', completed: false })"
  add-label="Add Todo"
>
  <template #default="{ item, index }">
    <!-- item is typed as TodoItem -->
    <!-- index is the array position -->
  </template>
</AppRepeatable>
```

## Slot Props

The default slot receives:

- `item`: The current item being rendered
- `index`: The position of the item in the array

## Styling

- Uses FontAwesome icons (`faPlus` for add, `faTimes` for remove)
- Follows the design system color scheme
- Remove buttons are positioned for easy access
- Consistent spacing with other form components

## Accessibility

- Proper button labels for screen readers
- Keyboard navigation support
- Focus management when adding/removing items
- ARIA labels for action buttons

## Best Practices

### Factory Functions

Always use factory functions that return new objects to avoid reference sharing:

```typescript
// ✅ Good - creates new object each time
const newItem = () => ({ name: '', value: '' });

// ❌ Bad - shares object reference
const newItem = { name: '', value: '' };
```

### Type Safety

Use TypeScript generics for better type safety:

```typescript
interface Contact {
  name: string;
  email: string;
}

const contacts = ref<Contact[]>([]);
```

### Performance

For large lists, consider virtualization or pagination instead of rendering all items at once.
