# AppNewsletterOptIn

A flexible newsletter subscription component that supports both simple opt-in and multi-group selection modes.

## Features

- **Dual Modes**: Automatically switches between simple checkbox and multi-group selection based on available groups
- **Rich Content**: Supports HTML content for descriptive text
- **Accessibility**: Includes proper ARIA labels and semantic HTML structure
- **Responsive Design**: Mobile-first approach with responsive styling
- **State Synchronization**: Automatically syncs opt-in status with selected groups

## Usage

### Simple Opt-in Mode

When no groups are provided, the component displays a single checkbox:

```vue
<AppNewsletterOptIn
  v-model="optInStatus"
  title="Newsletter Subscription"
  text="<p>Subscribe to our newsletter for updates.</p>"
  opt-in="Yes, I want to receive the newsletter"
  :groups="[]"
/>
```

### Multi-group Selection Mode

When groups are provided, users can select specific newsletter categories:

```vue
<AppNewsletterOptIn
  v-model="optInStatus"
  v-model:opt-in-groups="selectedGroups"
  title="Choose Your Subscriptions"
  text="<p>Select the topics you're interested in:</p>"
  opt-in="Subscribe to newsletter"
  :groups="newsletterGroups"
/>
```

## Props

| Prop              | Type                    | Required | Default               | Description                                   |
| ----------------- | ----------------------- | -------- | --------------------- | --------------------------------------------- |
| `title`           | `string`                | Yes      | -                     | Main title displayed above the opt-in options |
| `text`            | `string`                | Yes      | -                     | Descriptive text content (supports HTML)      |
| `optIn`           | `string`                | Yes      | -                     | Label for the simple opt-in checkbox          |
| `groups`          | `NewsletterGroupData[]` | Yes      | -                     | Available newsletter groups for selection     |
| `groupsAriaLabel` | `string`                | No       | `'Newsletter groups'` | ARIA label for the groups selection           |

## Models

| Model         | Type       | Description                               |
| ------------- | ---------- | ----------------------------------------- |
| `modelValue`  | `boolean`  | Main opt-in status (true when subscribed) |
| `optInGroups` | `string[]` | Array of selected group IDs               |

## Types

```typescript
interface NewsletterGroupData {
  id: string;
  label: string;
  checked: boolean;
}
```

## Behavior

- **Mode Detection**: Automatically determines display mode based on `groups.length`
- **Status Sync**: When groups are selected, `modelValue` automatically becomes `true`
- **Accessibility**: Proper ARIA labels and semantic HTML structure
- **Rich Content**: Text content supports HTML for enhanced formatting

## Accessibility

- Uses semantic `<section>` and `<header>` elements
- Provides proper ARIA labels for screen readers
- Supports keyboard navigation
- Maintains focus management
- Includes descriptive text for context

## Styling

The component includes scoped CSS classes for customization:

- `.newsletter-opt-in` - Main container
- `.newsletter-opt-in__groups` - Group selection container
- `.newsletter-opt-in__checkbox` - Simple opt-in checkbox
- `.content-message` - Rich text content area

## Examples

See the component stories for comprehensive examples including:

- Simple opt-in configuration
- Multi-group selection
- Rich text content
- Accessibility features
- Minimal setup
