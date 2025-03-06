# AppScrollNavigation

A navigation component that allows users to navigate between sections of content by scrolling. It automatically highlights the active section based on scroll position.

## Usage

```vue
<div class="flex gap-4">
  <AppScrollNavigation
    :sections="sections"
    title="Navigation"
    v-model:activeSection="activeSection"
  />
  
  <div class="flex-1 overflow-y-auto">
    <AppScrollSection
      id="section1"
      title="Section 1"
      @mounted="registerSection"
    >
      <p>Content for section 1</p>
    </AppScrollSection>
    
    <AppScrollSection
      id="section2"
      title="Section 2"
      @mounted="registerSection"
    >
      <p>Content for section 2</p>
    </AppScrollSection>
  </div>
</div>
```

## Props

| Prop              | Type              | Required | Default | Description                                            |
| ----------------- | ----------------- | -------- | ------- | ------------------------------------------------------ |
| `sections`        | `ScrollSection[]` | Yes      | -       | Array of sections to display in the navigation         |
| `title`           | `string`          | No       | `''`    | Optional title for the navigation                      |
| `scrollContainer` | `HTMLElement`     | No       | `null`  | Optional container element to listen for scroll events |

## Events

| Event                  | Payload  | Description                                         |
| ---------------------- | -------- | --------------------------------------------------- |
| `update:activeSection` | `string` | Emitted when the active section changes             |
| `section-change`       | `string` | Emitted when a section is clicked or becomes active |

## ScrollSection Interface

```typescript
interface ScrollSection {
  /** Unique identifier for the section */
  id: string;
  /** Display label for the section */
  label: string;
  /** Optional element reference for scrolling */
  element?: HTMLElement;
}
```

## Features

- Automatically highlights the active section based on scroll position
- Smooth scrolling to sections when clicked
- Support for custom scroll containers
- Two-way binding for active section

## Use Cases

### Form Builder Translations

Perfect for navigating between different sections of a translation form:

```vue
<div class="flex gap-4">
  <AppScrollNavigation
    :sections="[
      { id: 'buttons', label: 'Buttons' },
      { id: 'intro', label: 'Introduction' },
      { id: 'slides', label: 'Slides' },
      { id: 'thank-you', label: 'Thank You' }
    ]"
    title="Translations"
  />
  
  <div class="flex-1 overflow-y-auto">
    <AppScrollSection id="buttons" title="Buttons">
      <!-- Button translations -->
    </AppScrollSection>
    
    <AppScrollSection id="intro" title="Introduction">
      <!-- Introduction translations -->
    </AppScrollSection>
    
    <!-- More sections -->
  </div>
</div>
```

### Documentation Navigation

Useful for navigating through documentation sections:

```vue
<div class="flex gap-4">
  <AppScrollNavigation
    :sections="docSections"
    title="Documentation"
  />
  
  <div class="flex-1 overflow-y-auto">
    <AppScrollSection
      v-for="section in docSections"
      :key="section.id"
      :id="section.id"
      :title="section.label"
      @mounted="registerSection"
    >
      <!-- Section content -->
    </AppScrollSection>
  </div>
</div>
``` 
