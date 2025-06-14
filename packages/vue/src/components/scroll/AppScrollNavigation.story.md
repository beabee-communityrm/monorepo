# AppScrollNavigation

The `AppScrollNavigation` component provides a navigation sidebar that highlights the current section as users scroll through content.

## Usage Patterns

- **Documentation sites** - Table of contents with active section highlighting
- **Settings pages** - Navigate between configuration sections
- **Long forms** - Jump between form sections with progress indication
- **Content pages** - Article navigation with reading progress

## Key Features

- ✅ **Active section tracking** - Automatically highlights current section
- ✅ **Smooth scroll navigation** - Jump to sections with smooth animation
- ✅ **Sticky positioning** - Remains visible during page scroll
- ✅ **Progress indication** - Visual feedback of reading/completion progress

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
      @mounted="registerSection"
    >
      <AppFormBox title="Section 1">
        <p>Content for section 1</p>
      </AppFormBox>
    </AppScrollSection>

    <AppScrollSection
      id="section2"
      @mounted="registerSection"
    >
      <AppFormBox title="Section 2">
        <p>Content for section 2</p>
      </AppFormBox>
    </AppScrollSection>
  </div>
</div>
```
