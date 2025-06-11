# AppToggle

A horizontal toggle button group component for selecting between multiple exclusive options. Provides a clean, space-efficient alternative to radio buttons or select dropdowns for small sets of related choices.

## Use Cases

### View Mode Selection

Used in callout pages to switch between different view modes like list, grid, or map views.

```vue
<AppToggle
  v-model="currentView"
  :items="[
    { id: 'list', label: 'List' },
    { id: 'grid', label: 'Grid' },
    { id: 'map', label: 'Map' },
  ]"
/>
```

### Status Filtering

Implemented in admin interfaces for filtering content by status or category with visual button groups.

```vue
<AppToggle
  v-model="statusFilter"
  :items="[
    { id: 'active', label: 'Active' },
    { id: 'inactive', label: 'Inactive' },
    { id: 'pending', label: 'Pending' },
  ]"
/>
```

### Search Rule Filtering

Used in search interfaces to switch between different filter groups or search contexts.

```vue
<AppToggle v-model="selectedFilterGroup" :items="filterGroups" />
```

## Features

- **Exclusive Selection**: Only one option can be selected at a time
- **Visual Feedback**: Clear indication of selected state with background color
- **Compact Design**: Space-efficient horizontal layout with bullet separators
- **Keyboard Accessible**: Full keyboard navigation and selection support
- **Flexible Content**: Supports any number of options with dynamic labeling

## Props

### Required Props

- `modelValue`: Currently selected item ID (used with v-model)
- `items`: Array of selectable options with `id` and `label` properties

## Item Structure

Items follow a simple interface structure:

```typescript
interface ToggleItem {
  id: string;
  label: string;
}
```

Example:

```typescript
const viewOptions = [
  { id: 'list', label: 'List View' },
  { id: 'grid', label: 'Grid View' },
  { id: 'card', label: 'Card View' },
];
```

## Visual Design

### Layout Structure

- Horizontal arrangement of button elements
- Bullet (•) separators between options
- Consistent spacing and typography
- Responsive text sizing

### Selected State

- Background color highlight (`bg-primary-20`)
- Text color change for contrast
- Immediate visual feedback on selection

### Interactive States

- Default: Gray text with transparent background
- Hover: Subtle color transitions
- Selected: Primary background with contrast text
- Focus: Keyboard focus indicators

## Accessibility

- **Semantic Buttons**: Uses proper button elements for screen readers
- **Keyboard Navigation**: Tab navigation between options
- **Click Activation**: Enter/Space key activation support
- **Clear Labels**: Descriptive text for each option
- **Visual Indicators**: Color and background changes for state

## User Interaction

### Selection Behavior

- Single click to select an option
- Immediate visual feedback
- Emits update event to parent component
- Maintains selection state visually

### Navigation Pattern

- Left-to-right reading order
- Logical grouping of related options
- Clear separation between choices

## Integration Patterns

### With Search Systems

Often used to switch between search contexts:

```vue
<div class="search-controls">
  <AppToggle v-model="searchMode" :items="searchModes" />
  <AppSearchInput v-model="searchQuery" />
</div>
```

### With Content Views

Controls how content is displayed:

```vue
<AppToggle v-model="viewMode" :items="viewModes" />
<component :is="currentViewComponent" :data="contentData" />
```

### Filter Controls

Part of larger filtering interfaces:

```vue
<div class="filters">
  <AppToggle v-model="timeframe" :items="timeframes" />
  <AppSelect v-model="category" :items="categories" />
</div>
```

## Styling Considerations

### Typography

- Uses `text-sm` for compact appearance
- Bold font weight for better readability
- Primary color scheme integration

### Spacing

- Consistent margin (`mx-2`) between buttons
- Padding (`p-2`) for touch-friendly targets
- Proper line height for vertical alignment

### Responsive Behavior

- Maintains horizontal layout on mobile
- Touch-friendly button sizes
- Readable text at all screen sizes

## Best Practices

### Option Design

- Keep labels short and descriptive
- Use consistent terminology across options
- Limit to 2-5 options for optimal UX
- Consider the cognitive load of choices

### Use Cases

Ideal for:

- View mode switching
- Quick filter toggles
- Binary or ternary choices
- Tab-like navigation within sections

Not recommended for:

- Large numbers of options (use AppSelect instead)
- Complex nested choices
- Options requiring additional context

### Performance

- Lightweight component with minimal overhead
- No external dependencies beyond Vue
- Efficient rendering for any number of options

## Comparison with Alternatives

### vs Radio Buttons

- More compact visual presentation
- Better for horizontal layouts
- Integrates better with modern design systems

### vs Select Dropdown

- Immediate visibility of all options
- No additional interaction required to see choices
- Better for frequently changed settings

### vs Tabs

- More subtle visual impact
- Better for filtering/mode selection rather than content organization
- Doesn't imply separate content areas
