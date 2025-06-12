# AppConfirmDialog

A confirmation dialog that wraps `AppModal` with predefined cancel and confirm buttons for user decision flows.

## Usage Patterns

- **Destructive actions** - Delete confirmations with `variant="danger"` styling
- **Important decisions** - Save/discard changes, permanent operations  
- **User agreements** - Terms acceptance with single confirm button
- **Async operations** - Actions requiring loading states with `onConfirm` prop

## Key Features

- ✅ **Consistent button layout** - Cancel (left) and Confirm (right) positioning
- ✅ **Loading state management** - Automatic loading indicators for async operations
- ✅ **Flexible content** - Any content via default slot with structured button footer
