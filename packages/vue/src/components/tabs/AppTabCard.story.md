# AppTabCard

A versatile tab card component that provides a tabbed interface with two visual variants and support for sticky tabs. It's designed to work seamlessly with `AppFormBox` and other components.

## Usage

```vue
<!-- Boxed variant (default) -->
<AppTabCard v-model="selectedTab" :items="tabs">
  <template #default="{ selected }">
    <div>Content for {{ selected }} tab</div>
  </template>
</AppTabCard>

<!-- Transparent variant with AppFormBox -->
<AppTabCard v-model="selectedTab" :items="tabs" variant="transparent">
  <template #default="{ selected }">
    <AppFormBox title="Form Title">
      <!-- Form content -->
    </AppFormBox>
  </template>
</AppTabCard>

<!-- With sticky tabs -->
<div class="relative h-[400px] overflow-y-auto" style="contain: paint;">
  <AppTabCard
    v-model="selectedTab"
    :items="tabs"
    :sticky-tabs="true"
  >
    <template #default="{ selected }">
      <!-- Scrollable content -->
    </template>
  </AppTabCard>
</div>
```

## Props

| Prop         | Type                     | Required | Default   | Description                                             |
| ------------ | ------------------------ | -------- | --------- | ------------------------------------------------------- |
| `items`      | `TabItem[]`              | Yes      | -         | Array of tab items to display                           |
| `modelValue` | `string`                 | Yes      | -         | Currently selected tab ID                               |
| `variant`    | `'boxed'｜'transparent'` | No       | `'boxed'` | Visual variant of the tab card                          |
| `stickyTabs` | `boolean`                | No       | `false`   | Whether the tabs should stick to the top when scrolling |

## Events

| Event               | Payload  | Description                    |
| ------------------- | -------- | ------------------------------ |
| `update:modelValue` | `string` | Emitted when a tab is selected |

## TabItem Interface

```typescript
interface TabItem {
  /** Unique identifier for the tab */
  id: string;
  /** Display label for the tab */
  label: string;
  /** Optional count to display next to the label */
  count?: number;
}
```

## Features

### Visual Variants

- **Boxed (Default)**: A contained look with a white background, border, and shadow
- **Transparent**: No background or border, perfect for use with `AppFormBox` components

### Sticky Tabs

- Tabs can be made sticky using the `sticky-tabs` prop
- Useful for long scrollable content where you want the tabs to remain accessible
- Automatically handles z-index and positioning
- For proper sticky behavior, place the component inside a container with:
  - `position: relative`
  - `overflow-y: auto`
  - `style="contain: paint;"` (helps with rendering performance and stacking context)

### Integration with AppFormBox

- Designed to work seamlessly with `AppFormBox` components
- The transparent variant allows `AppFormBox` to maintain its visual hierarchy

## Use Cases

### Translation Forms

Perfect for managing translations with sticky tabs:

```vue
<div class="relative h-[600px] overflow-y-auto" style="contain: paint;">
  <AppTabCard
    v-model="selectedLocale"
    :items="locales"
    :sticky-tabs="true"
    variant="transparent"
  >
    <template #default="{ selected }">
      <AppFormBox title="General Information">
        <!-- Translation fields -->
      </AppFormBox>
      
      <AppFormBox title="Additional Content">
        <!-- More translation fields -->
      </AppFormBox>
    </template>
  </AppTabCard>
</div>
```

### Status Views

Use the boxed variant for status-based content:

```vue
<AppTabCard
  v-model="selectedStatus"
  :items="[
    { id: 'pending', label: 'Pending', count: 3 },
    { id: 'approved', label: 'Approved', count: 12 },
  ]"
>
  <template #default="{ selected }">
    <!-- Status-specific content -->
  </template>
</AppTabCard>
```

### Form Sections

Use the transparent variant with `AppFormBox` for sectioned forms:

```vue
<AppTabCard v-model="selectedSection" :items="sections" variant="transparent">
  <template #default="{ selected }">
    <AppFormBox :title="selected">
      <!-- Section-specific form fields -->
    </AppFormBox>
  </template>
</AppTabCard>
```
