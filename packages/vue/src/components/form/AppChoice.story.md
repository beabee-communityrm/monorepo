# AppChoice

The `AppChoice` component provides a button group for selecting a single option from multiple choices in a visually distinct, button-like interface.

## Usage Patterns

- **Contribution amounts** - Predefined donation values (€5, €10, €25, €50)
- **Payment periods** - Monthly vs Yearly subscription options
- **Display modes** - List, Grid, Card view toggles  
- **Configuration options** - Settings with predefined choices

## Key Features

- ✅ **Button group design** - Connected buttons with primary color scheme
- ✅ **Two sizes** - Extra small (xs) and small (sm) variants
- ✅ **Generic typing** - Supports both string and number values
- ✅ **Keyboard navigation** - Arrow keys, Home/End support with focus management

## Usage

```vue
<AppChoice
  v-model="selectedValue"
  :items="[
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' },
  ]"
  size="sm"
/>
```

## How It Works

The AppChoice component:

1. Renders a flexible button group with rounded borders
2. Each button represents a selectable option
3. The selected button gets highlighted with the link color and white text
4. Non-selected buttons show hover effects for better UX
5. Uses generic TypeScript typing to support both string and number values
6. Automatically handles button sizing and responsiveness
7. Maintains proper spacing and visual hierarchy

This creates a modern, accessible choice component that works well for quick selections in forms and interfaces.
