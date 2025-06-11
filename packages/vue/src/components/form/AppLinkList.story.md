# AppLinkList

A reusable component for managing dynamic lists of links with text and URL pairs. Built on top of the `AppRepeatable` component, it provides an intuitive interface for adding, editing, and removing links.

## Use Cases

### Footer Links Management

Used in the admin settings to manage additional footer links that appear on the website. Administrators can add custom navigation links, policy pages, or external resources.

```vue
<AppLinkList
  v-model="footerData.footerLinks"
  text-label="Link Text"
  url-label="URL"
  add-label="Add Footer Link"
  placeholder-label="e.g., About Us"
  placeholder-url="e.g., /about"
/>
```

### Callout Response Links

Configures additional action links that appear with each response in callout views. Supports URL patterns with placeholders like `{id}` for dynamic content.

```vue
<AppLinkList
  v-model="localData.responseLinks"
  text-label="Link Text"
  url-label="URL Pattern"
  add-label="Add Response Link"
  placeholder-label="e.g., View Details"
  placeholder-url="e.g., /response/{id}"
/>
```

## Features

- **Dynamic List Management**: Add and remove link entries with a clean interface
- **Validation**: Both text and URL fields are required by default
- **Flexible Labeling**: All labels and placeholders are configurable via props
- **Type Safety**: Full TypeScript support with proper prop interfaces
- **Consistent UI**: Uses the same form components (`AppInput`) for consistent styling

## Props

### Required Props

- `modelValue`: Array of link objects with `text` and `url` properties
- `addLabel`: Text for the "Add" button (defaults to "Add Link")

### Optional Props

- `textLabel`: Label for the text input field
- `urlLabel`: Label for the URL input field
- `placeholderLabel`: Placeholder text for the text input
- `placeholderUrl`: Placeholder text for the URL input

## Data Structure

The component expects and emits an array of objects with this structure:

```typescript
interface LinkItem {
  text: string;
  url: string;
}
```

## Accessibility

- Uses semantic form labels for screen readers
- Provides clear button labels for add/remove actions
- Maintains proper focus management when adding/removing items
- All inputs include appropriate `required` attributes

## Integration with AppRepeatable

`AppLinkList` is a specialized implementation of the generic `AppRepeatable` component, demonstrating how to create domain-specific form components while maintaining reusability and consistency.
