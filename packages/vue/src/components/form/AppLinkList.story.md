# AppLinkList

The `AppLinkList` component displays a list of clickable links with consistent styling and optional icons for navigation or actions.

## Usage Patterns

- **Navigation menus** - Lists of page or section links
- **Action lists** - Collections of user actions or operations
- **Resource lists** - Links to external resources or documents
- **Quick links** - Frequently accessed pages or functions

## Key Features

- ✅ **Consistent styling** - Standardized link appearance across the application
- ✅ **Icon support** - Optional icons for visual context and recognition
- ✅ **Router integration** - Works with Vue Router for internal navigation
- ✅ **External links** - Proper handling of external URLs with security

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

## Integration with AppRepeatable

`AppLinkList` is a specialized implementation of the generic `AppRepeatable` component, demonstrating how to create domain-specific form components while maintaining reusability and consistency.
