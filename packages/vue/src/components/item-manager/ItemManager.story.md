# ItemManager

The `ItemManager` component provides a comprehensive solution for managing lists of items with CRUD (Create, Read, Update, Delete) operations. It's designed to handle common use cases like managing tags, reviewers, roles, or any other list-based data.

## Features

- **Full CRUD Operations**: Add, view, edit, and delete items
- **Confirmation Dialogs**: Built-in confirmation for destructive actions
- **Customizable Text**: All button texts and messages can be customized
- **Generic Type Support**: Works with any data type through TypeScript generics
- **Flexible Form Content**: Uses slots for custom form layouts
- **Read-only Mode**: Optional disable of update functionality
- **Accessible**: Proper ARIA attributes and keyboard navigation

## Component Architecture

The ItemManager component is built from three sub-components:

1. **ItemManager** - Main container that handles the list and add functionality
2. **ItemManagerItem** - Individual item display with edit/delete actions
3. **ItemManagerForm** - Form handling for both add and edit modes

This modular architecture allows each component to be used independently if needed, while providing a complete solution when used together.
