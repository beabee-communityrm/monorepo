# AppNewsletterOptInSettings

An administrative configuration component for setting up newsletter opt-in forms. This component provides a complete interface for configuring newsletter subscription options including title, content, labels, and group management.

## Features

- **Complete Configuration**: Configure all aspects of newsletter opt-in forms
- **Rich Text Editing**: Built-in rich text editor for content creation
- **Group Management**: Dynamic newsletter group configuration with repeatable fields
- **Smart Validation**: Conditional field requirements based on configuration
- **Accessibility**: Full accessibility support with proper labeling
- **Responsive Design**: Mobile-first responsive layout

## Usage

```vue
<AppNewsletterOptInSettings
  v-model:title="newsletterTitle"
  v-model:text="newsletterText"
  v-model:opt-in="optInLabel"
  v-model:groups="newsletterGroups"
  :labels="configLabels"
  :editor-labels="richTextLabels"
/>
```

## Props

| Prop           | Type                               | Required | Description                             |
| -------------- | ---------------------------------- | -------- | --------------------------------------- |
| `labels`       | `AppNewsletterOptInSettingsLabels` | Yes      | Text labels for all UI elements         |
| `editorLabels` | `RichTextEditorLabels`             | Yes      | Labels for the rich text editor toolbar |

## Models

| Model    | Type                    | Description                           |
| -------- | ----------------------- | ------------------------------------- |
| `title`  | `string`                | Newsletter title/heading              |
| `text`   | `string`                | Newsletter description content (HTML) |
| `optIn`  | `string`                | Label for simple opt-in checkbox      |
| `groups` | `NewsletterGroupData[]` | Newsletter group configurations       |

## Label Interface

```typescript
interface AppNewsletterOptInSettingsLabels {
  title: string; // Label for title input
  text: string; // Label for text editor
  optInLabel: string; // Label for opt-in input
  optInDisabled: string; // Help text when opt-in is disabled
  groupsTitle: string; // Groups section title
  groupsHelp: string; // Groups help text (HTML)
  groupsAdd: string; // Add group button label
  commonId: string; // Group ID field label
  commonLabel: string; // Group label field label
  commonDefault: string; // Default checkbox label
}
```

## Types

```typescript
interface NewsletterGroupData {
  id: string; // Unique group identifier
  label: string; // Display name for the group
  checked: boolean; // Whether group is selected by default
}

interface RichTextEditorLabels {
  bold: string;
  italic: string;
  underline: string;
  strikethrough: string;
  heading: string;
  bulletList: string;
  numberedList: string;
  link: string;
}
```

## Configuration Behavior

### Simple Mode

When no groups are configured:

- Opt-in field is **required** and **enabled**
- Users will see a single checkbox with the opt-in label

### Group Mode

When groups are configured:

- Opt-in field becomes **disabled** (groups take precedence)
- Users can select from multiple newsletter categories
- Each group can have a default selection state

## Field Validation

- **Title**: Always required
- **Text**: Always required (rich text content)
- **Opt-in Label**: Required only when no groups are configured
- **Group Fields**: ID and Label are required for each group

## Rich Text Features

The text editor supports:

- **Bold**, _Italic_, Underline, ~~Strikethrough~~
- Headings (H1-H6)
- Bullet and numbered lists
- Links
- Full keyboard navigation
- Customizable toolbar labels

## Accessibility Features

- **Form Labels**: All inputs have proper labels
- **Required Indicators**: Required fields are clearly marked
- **Help Text**: Contextual help for complex features
- **Disabled States**: Clear indication of disabled fields
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA labels and descriptions

## Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Flexible Layout**: Adapts to different screen sizes
- **Touch-Friendly**: Large tap targets for mobile interaction
- **Stacked Layout**: Form fields stack vertically on small screens

## Examples

### Basic Configuration

```vue
<AppNewsletterOptInSettings
  v-model:title="title"
  v-model:text="text"
  v-model:opt-in="optIn"
  v-model:groups="[]"
  :labels="basicLabels"
  :editor-labels="editorLabels"
/>
```

### With Newsletter Groups

```vue
<AppNewsletterOptInSettings
  v-model:title="title"
  v-model:text="text"
  v-model:opt-in="optIn"
  v-model:groups="groups"
  :labels="advancedLabels"
  :editor-labels="editorLabels"
/>
```

## Integration Notes

This component is designed for administrative interfaces where users configure newsletter opt-in forms. The output configuration can be used with `AppNewsletterOptIn` to display the actual subscription form to end users.

## Styling

The component includes responsive styling with these CSS classes:

- `.newsletter-opt-in-settings` - Main container
- `.newsletter-opt-in-settings__title` - Title input field
- `.newsletter-opt-in-settings__text` - Text editor field
- `.newsletter-opt-in-settings__opt-in` - Opt-in input field
- `.newsletter-opt-in-settings__groups` - Groups section
- `.newsletter-group__*` - Individual group field classes
