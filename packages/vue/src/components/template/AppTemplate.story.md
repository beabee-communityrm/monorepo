# AppTemplate

The `AppTemplate` component serves as a **reference template** for creating new components in this Vue component library. It demonstrates essential patterns, best practices, and accessibility standards that should be followed when building new components.

## Purpose

This component is designed as a **living example** that showcases:

- ✅ **Semantic HTML elements** and **ARIA attributes** for accessibility
- ✅ **Keyboard navigation** support (Enter, Space, Tab)
- ✅ **Mobile-first design** with responsive Tailwind CSS classes
- ✅ **Touch-friendly UI** with appropriate touch targets
- ✅ **TypeScript interfaces** with comprehensive JSDoc documentation
- ✅ **Flexible content structure** using slots
- ✅ **Event documentation** with TSDoc comments
- ✅ **Consistent styling patterns** matching other library components

## Usage

```vue
<AppTemplate
  title="Example Card"
  description="This demonstrates the template component"
  variant="primary"
  size="md"
  :icon="faHome"
  badge="New"
  @click="handleClick"
>
  <p>Your main content goes here</p>
  
  <template #footer>
    <AppButton size="sm">Action</AppButton>
  </template>
</AppTemplate>
```

## API Reference

### Props

All props are defined in the `AppTemplateProps` interface in the component source code. See the TypeScript interface for complete prop documentation including types, defaults, and descriptions.

### Events

Events are documented with TSDoc comments directly in the component source code using `defineEmits`. Check the component implementation for detailed event documentation including parameter types and usage.

### Slots

Slots are documented with TSDoc comments directly in the component source code using `defineSlots<>()`. Check the component implementation for detailed slot documentation including descriptions and usage recommendations.

## Examples

All usage examples and interactive demonstrations are available in the component stories. The stories showcase:

- **Basic Usage** - Simple template with title and content
- **All Features** - Complete example with all props and slots
- **Different Variants** - Visual variants (primary, secondary, success, warning, danger)
- **Size Options** - Different size configurations (sm, md, lg)
- **Interactive Controls** - Live playground to test all features
- **Accessibility Demo** - Keyboard navigation and screen reader features

## Component Development Guidelines

When creating new components based on this template:

### 1. Accessibility Standards
- Use semantic HTML elements (`<header>`, `<main>`, `<footer>`, etc.)
- Include ARIA attributes (`role`, `aria-label`, `aria-describedby`)
- Support keyboard navigation (Tab, Enter, Space)
- Provide proper focus management and visual indicators
- Test with screen readers when possible

### 2. TypeScript Patterns
- Define comprehensive prop interfaces with JSDoc comments
- Document events with TSDoc using the `defineEmits<>()` syntax
- Use proper type exports for consumer TypeScript support
- Include optional parameter documentation

### 3. Styling Consistency
- Use mobile-first responsive design with Tailwind CSS
- Follow the established color system (`primary-40`, `body-80`, etc.)
- Include proper focus states (`focus:ring-2`, `focus:ring-primary-70`)
- Use consistent spacing and sizing patterns
- Implement hover and active states appropriately

### 4. Code Structure
- Keep styling classes simple and consistent with existing components
- Use `computed` properties for complex class logic
- Implement defensive programming in event handlers
- Generate unique IDs for ARIA relationships when needed
- Use `withDefaults()` for prop defaults

### 5. Documentation
- Create comprehensive `.story.md` documentation
- Build interactive `.story.vue` examples demonstrating all features
- Reference TypeScript interfaces instead of repeating prop details
- Focus on usage patterns and real-world examples

## Design Patterns Demonstrated

### Mobile-First Approach
- Base styles apply to mobile screens first
- Progressive enhancement for larger screens
- Touch-friendly target sizes (minimum 44x44px)
- Appropriate spacing between interactive elements

### Accessibility Integration
- ARIA attributes integrated seamlessly
- Keyboard navigation as a first-class feature
- Screen reader compatibility built-in
- Focus management handled automatically

### Component Flexibility
- Props for customization without breaking consistency
- Slots for content projection
- Event system for interaction handling
- Disabled states properly implemented

This template serves as both a functional component and a comprehensive reference for building accessible, maintainable Vue components that integrate seamlessly with the existing component library. 
