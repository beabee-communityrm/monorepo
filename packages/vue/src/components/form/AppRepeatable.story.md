# AppRepeatable

The `AppRepeatable` component provides a dynamic list interface where users can add, remove, and reorder items with customizable form content.

## Usage Patterns

- **Dynamic forms** - Add/remove form sections like contact information or skills
- **List management** - Manage collections of links, tags, or categories  
- **Multi-item input** - Handle arrays of structured data in forms
- **Configuration lists** - Build dynamic configuration with repeated elements

## Key Features

- ✅ **Add/remove items** - Dynamic list manipulation with user controls
- ✅ **Drag-and-drop reordering** - Intuitive item organization
- ✅ **Custom content** - Flexible slot-based content for any data structure
- ✅ **Validation support** - Per-item validation with error handling

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
