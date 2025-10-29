# Frontend Code Structure

Whenever you write HTML or UI code, make sure to
- Mobile-first design approach
- Tailwind CSS styling with responsive design
- Accessibility with **semantic HTML elements** and **ARIA attributes**
- Focus management and keyboard navigation
- Touch-Friendly UI with interactive elements for easy tapping and **touch gestures** for common actions
- Include `role` attributes when semantic elements aren't sufficient
- Provide alternative text for images and icons (`alt` attribute, `aria-hidden="true"` for decorative)
- Maintain logical focus order and visible focus indicators

## Code Standards
- **TypeScript**: Comprehensive prop interfaces with JSDoc, `defineEmits<>()` syntax
- **Styling**: Mobile-first Tailwind CSS, established color system
- **Structure**: `computed` for class logic, `withDefaults()` for props, defensive event handlers

## Accessibility
- Semantic HTML (`<header>`, `<main>`, `<footer>`)
- ARIA attributes (`role`, `aria-label`, `aria-describedby`)
- Keyboard navigation (Tab, Enter, Space)
- Focus management and visual indicators
- Touch-friendly targets (44x44px minimum)

## Features
- Props for customization
- Slots for content projection
- Event system for interactions
- Proper disabled states
- Responsive design with hover/active states
