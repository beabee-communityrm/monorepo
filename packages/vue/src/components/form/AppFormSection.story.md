# AppFormSection

A layout component that provides a structured two-column grid for form sections with help text. Designed to create consistent spacing and alignment between form content and its accompanying documentation or guidance.

## Use Cases

### Admin Configuration Forms

Used throughout admin settings to provide contextual help alongside form controls, improving user experience and reducing configuration errors.

```vue
<AppFormSection help="Complete your profile information below.">
  <div class="space-y-4">
    <AppInput label="First Name" required />
    <AppInput label="Last Name" required />
    <AppInput label="Email" type="email" required />
  </div>
</AppFormSection>
```

### Advanced Settings with Guidance

Particularly useful for complex configuration sections where users need additional context or warnings about their choices.

```vue
<AppFormSection
  help="These settings control advanced features. <strong>Use with caution.</strong>"
>
  <div class="space-y-4">
    <AppInput label="API Key" type="password" />
    <AppInput label="Webhook URL" type="url" />
  </div>
</AppFormSection>
```

## Features

- **Two-Column Layout**: Automatic grid layout with form content on the left and help text on the right
- **HTML Support**: Help text supports HTML formatting for rich content presentation
- **Responsive Design**: Adapts gracefully to different screen sizes
- **Consistent Spacing**: Standardized margins and padding for visual consistency
- **Flexible Content**: Uses slots to accommodate any form content structure

## Props

### Optional Props

- `help`: HTML string containing help text or guidance information

## Layout Structure

The component creates a CSS Grid with two columns:

1. **Left Column** (col-span-1): Contains the main form content via the default slot
2. **Right Column** (col-span-1): Displays the help text with appropriate styling

## Styling Details

- **Grid Layout**: Uses `grid-cols-2` for equal-width columns
- **Alignment**: `items-end` ensures proper vertical alignment
- **Spacing**: `gap-6` provides consistent spacing between columns
- **Typography**: Help text uses small, gray styling for subtle guidance
- **Content Support**: Uses `v-html` for rich text formatting in help content

## HTML Content Support

The help text accepts HTML content, allowing for:

- **Bold text**: `<strong>Important notes</strong>`
- **Links**: `<a href="#">Learn more</a>`
- **Lists**: `<ul><li>Item 1</li><li>Item 2</li></ul>`
- **Emphasis**: `<em>Use with caution</em>`

## Responsive Behavior

While the current implementation uses a fixed two-column layout, it's designed to work within responsive parent containers that can adjust the overall form layout on smaller screens.

## Accessibility

- **Semantic Structure**: Uses standard div elements with proper CSS for layout
- **Content Association**: Help text is visually associated with form content
- **HTML Support**: Allows for proper semantic markup in help content

## Best Practices

### Help Text Guidelines

- Keep help text concise but informative
- Use HTML formatting sparingly for emphasis
- Provide actionable guidance rather than just descriptions
- Consider the cognitive load of additional information

### Content Organization

- Group related form fields together within a single section
- Use multiple sections for logically separate configuration areas
- Ensure form content and help text are balanced in length

### Integration Patterns

Works well with other form components:

- Wrap groups of related `AppInput` components
- Combine with `AppFormBox` for visual grouping
- Use within larger form layouts and wizards

## Layout Considerations

The two-column layout works best when:

- Form content is relatively compact
- Help text provides meaningful value
- Screen space allows for side-by-side content
- Related information benefits from proximity
