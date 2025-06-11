# AppSelect

A comprehensive dropdown selection component built on vue-multiselect with enhanced styling, validation, and accessibility features. Provides flexible options for single-value selection with optional search functionality.

## Use Cases

### Language Selection

Used in admin settings for configuring the site language with a clean dropdown interface.

```vue
<AppSelect
  v-model="generalData.locale"
  label="Language"
  :items="localeItems"
  required
/>
```

### Category Filtering

Implemented throughout admin interfaces for filtering data by categories, tags, or other classification systems.

```vue
<AppSelect
  v-model="currentTag"
  placeholder="Search tags..."
  :items="tagItems"
  searchable
/>
```

### Configuration Options

Used in various admin settings for selecting predefined configuration values like periods, statuses, or operational modes.

```vue
<AppSelect
  v-model="contributionPeriod"
  label="Billing Period"
  :items="periodOptions"
  required
  description="How often members will be charged"
/>
```

## Features

- **Built on vue-multiselect**: Leverages a mature, accessible dropdown library
- **Search Integration**: Optional search functionality for large option lists
- **Validation Support**: Full integration with Vuelidate for form validation
- **Rich Labeling**: Support for labels, descriptions, and help text
- **Type Safety**: Generic TypeScript support for string and number values
- **Consistent Styling**: Matches design system with other form components

## Props

### Basic Props

- `modelValue`: Currently selected value (used with v-model)
- `items`: Array of selectable items with `id` and `label` properties
- `label`: Label text displayed above the select
- `placeholder`: Placeholder text when no option is selected

### Behavior Props

- `searchable`: Enable search/filter functionality (default: true)
- `required`: Mark field as required for validation
- `disabled`: Disable the entire select component

### UI Props

- `description`: Descriptive text shown below the label
- `infoMessage`: Help text displayed below the select

## Item Structure

Items must follow the `SelectItem` interface:

```typescript
interface SelectItem<T extends string | number> {
  id: T;
  label: string;
}
```

Example:

```typescript
const countryItems = [
  { id: 'us', label: 'United States' },
  { id: 'uk', label: 'United Kingdom' },
  { id: 'ca', label: 'Canada' },
];
```

## Validation Integration

The component integrates with Vuelidate for comprehensive validation:

```vue
<AppSelect
  v-model="selectedOption"
  :items="options"
  required
  label="Required Selection"
/>
```

Validation features:

- Required field validation
- Custom error message display
- Visual error states with red borders
- ARIA attributes for screen readers

## Search Functionality

When `searchable` is enabled:

- Users can type to filter options
- Case-insensitive matching
- Highlights matching text
- Keyboard navigation support

```vue
<AppSelect
  v-model="country"
  :items="countryList"
  searchable
  placeholder="Search countries..."
/>
```

## Accessibility Features

- **ARIA Support**: Proper ARIA attributes for screen readers
- **Keyboard Navigation**: Full keyboard support (arrow keys, Enter, Escape)
- **Focus Management**: Clear focus indicators and logical focus flow
- **Label Association**: Proper label-input relationships
- **Error Announcement**: Screen reader announcements for validation errors

## Styling and States

### Default State

- Clean border with primary color scheme
- Proper spacing and typography
- Consistent with other form components

### Focus State

- Enhanced border color and shadow
- Clear visual feedback for keyboard users
- Maintains accessibility contrast requirements

### Error State

- Red border and background tinting
- Error message display below select
- ARIA attributes for error association

### Disabled State

- Grayed appearance with reduced opacity
- Cursor indication of non-interactive state
- Proper keyboard navigation exclusion

## Generic Type Support

The component supports generic types for type-safe value handling:

```vue
<script setup lang="ts">
// String values
const stringSelect = ref<string>('');
const stringOptions: SelectItem<string>[] = [
  { id: 'option1', label: 'Option 1' },
];

// Number values
const numberSelect = ref<number>(0);
const numberOptions: SelectItem<number>[] = [{ id: 1, label: 'Priority 1' }];
</script>
```

## Integration Patterns

### With Forms

Works seamlessly with form validation:

```vue
<AppForm @submit="handleSubmit">
  <AppSelect v-model="category" :items="categories" required />
  <AppSelect v-model="priority" :items="priorities" />
</AppForm>
```

### With Search Systems

Often combined with other filtering components:

```vue
<div class="filters">
  <AppSearchInput v-model="search" />
  <AppSelect v-model="category" :items="categories" />
  <AppSelect v-model="status" :items="statuses" />
</div>
```

## Best Practices

### Option Design

- Keep labels concise but descriptive
- Use consistent naming conventions
- Order options logically (alphabetical, by priority, etc.)
- Consider adding "None" or "All" options when appropriate

### Performance

- For large datasets, consider virtual scrolling
- Implement debounced search for remote data
- Cache frequently used option lists

### User Experience

- Provide meaningful placeholder text
- Use descriptions for complex options
- Consider grouping related options
- Test with keyboard navigation and screen readers
