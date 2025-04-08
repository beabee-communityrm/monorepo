# AppScrollSection

A section component designed to work with `AppScrollNavigation` for creating scrollable content sections with navigation. It is typically used with `AppFormBox` to provide visual structure to the content.

## Usage

```vue
<AppScrollSection id="section1">
  <AppFormBox title="Section Title">
    <p>This is the content of the section.</p>
  </AppFormBox>
</AppScrollSection>
```

## Props

| Prop | Type     | Required | Default | Description                       |
| ---- | -------- | -------- | ------- | --------------------------------- |
| `id` | `string` | Yes      | -       | Unique identifier for the section |

## Events

| Event     | Payload                            | Description                                                                         |
| --------- | ---------------------------------- | ----------------------------------------------------------------------------------- |
| `mounted` | `id: string, element: HTMLElement` | Emitted when the section is mounted, providing the section ID and element reference |

## Features

- Designed to be used with `AppFormBox` for consistent styling
- Automatic spacing between sections
- Scroll margin to ensure proper scrolling position
- Integration with `AppScrollNavigation` for navigation

## Use Cases

### Form Builder Translations

Used to organize different sections of translations:

```vue
<div class="flex gap-4">
  <AppScrollNavigation :sections="sections" />

  <div class="flex-1 overflow-y-auto">
    <AppScrollSection id="buttons">
      <AppFormBox title="Buttons">
        <!-- Button translations -->
      </AppFormBox>
    </AppScrollSection>

    <AppScrollSection id="intro">
      <AppFormBox title="Introduction">
        <!-- Introduction translations -->
      </AppFormBox>
    </AppScrollSection>

    <AppScrollSection id="slides">
      <AppFormBox title="Slides">
        <!-- Slide translations -->
      </AppFormBox>
    </AppScrollSection>
  </div>
</div>
```

### Documentation Pages

Perfect for organizing documentation content:

```vue
<AppScrollSection id="installation">
  <AppFormBox title="Installation">
    <p>Installation instructions...</p>
    <pre><code>npm install @beabee/vue</code></pre>
  </AppFormBox>
</AppScrollSection>

<AppScrollSection id="usage">
  <AppFormBox title="Usage">
    <p>Usage examples...</p>
  </AppFormBox>
</AppScrollSection>

<AppScrollSection id="api">
  <AppFormBox title="API Reference">
    <p>API documentation...</p>
  </AppFormBox>
</AppScrollSection>
```

### Settings Pages

Useful for organizing settings into logical sections:

```vue
<AppScrollSection id="general">
  <AppFormBox title="General Settings">
    <!-- General settings form -->
  </AppFormBox>
</AppScrollSection>

<AppScrollSection id="account">
  <AppFormBox title="Account Settings">
    <!-- Account settings form -->
  </AppFormBox>
</AppScrollSection>

<AppScrollSection id="notifications">
  <AppFormBox title="Notification Settings">
    <!-- Notification settings form -->
  </AppFormBox>
</AppScrollSection>
```
