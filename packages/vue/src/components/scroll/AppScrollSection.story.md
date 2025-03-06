# AppScrollSection

A section component designed to work with `AppScrollNavigation` for creating scrollable content sections with navigation.

## Usage

```vue
<AppScrollSection id="section1" title="Section Title">
  <p>This is the content of the section.</p>
</AppScrollSection>
```

## Props

| Prop    | Type     | Required | Default | Description                       |
| ------- | -------- | -------- | ------- | --------------------------------- |
| `id`    | `string` | Yes      | -       | Unique identifier for the section |
| `title` | `string` | No       | `''`    | Title of the section              |

## Events

| Event     | Payload                            | Description                                                                         |
| --------- | ---------------------------------- | ----------------------------------------------------------------------------------- |
| `mounted` | `id: string, element: HTMLElement` | Emitted when the section is mounted, providing the section ID and element reference |

## Features

- Consistent styling for section titles and content
- Automatic spacing between sections
- Border separators between sections (except for the first section)
- Scroll margin to ensure proper scrolling position
- Integration with `AppScrollNavigation` for navigation

## Use Cases

### Form Builder Translations

Used to organize different sections of translations:

```vue
<div class="flex gap-4">
  <AppScrollNavigation :sections="sections" />
  
  <div class="flex-1 overflow-y-auto">
    <AppScrollSection id="buttons" title="Buttons">
      <!-- Button translations -->
    </AppScrollSection>
    
    <AppScrollSection id="intro" title="Introduction">
      <!-- Introduction translations -->
    </AppScrollSection>
    
    <AppScrollSection id="slides" title="Slides">
      <!-- Slide translations -->
    </AppScrollSection>
  </div>
</div>
```

### Documentation Pages

Perfect for organizing documentation content:

```vue
<AppScrollSection id="installation" title="Installation">
  <p>Installation instructions...</p>
  <pre><code>npm install @beabee/vue</code></pre>
</AppScrollSection>

<AppScrollSection id="usage" title="Usage">
  <p>Usage examples...</p>
</AppScrollSection>

<AppScrollSection id="api" title="API Reference">
  <p>API documentation...</p>
</AppScrollSection>
```

### Settings Pages

Useful for organizing settings into logical sections:

```vue
<AppScrollSection id="general" title="General Settings">
  <!-- General settings form -->
</AppScrollSection>

<AppScrollSection id="account" title="Account Settings">
  <!-- Account settings form -->
</AppScrollSection>

<AppScrollSection id="notifications" title="Notification Settings">
  <!-- Notification settings form -->
</AppScrollSection>
``` 
