# AppConfirmDialog

A confirmation dialog that wraps `AppModal` with predefined cancel and confirm buttons for user decision flows.

## Usage Patterns

- **Destructive actions** - Delete confirmations, data loss warnings
- **Important decisions** - Save/discard changes, permanent operations
- **User agreements** - Terms acceptance, policy confirmations
- **Async operations** - Actions requiring loading states during processing

## Implementation Notes

Built on top of `AppModal` with:

- **Consistent button layout** - Cancel (left) and Confirm (right) positioning
- **Loading state management** - Automatic loading indicators for async operations
- **Flexible content** - Any content via default slot while maintaining button structure
