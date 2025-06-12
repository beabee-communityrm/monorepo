# AppAsyncButton

The `AppAsyncButton` component extends `AppButton` with built-in handling for asynchronous operations. It automatically manages loading state and error notifications.

## Usage Patterns

- **Form submission** - Save, update, create operations
- **Data loading** - Fetch, refresh, reload actions  
- **File operations** - Upload, download, export tasks
- **API calls** - Any action requiring async processing

## Key Features

- ✅ **Automatic loading state** - Shows loading spinner during async operations
- ✅ **Error notifications** - Displays error toasts when operations fail  
- ✅ **All AppButton props** - Inherits all styling and behavior options

## Usage

```vue
<AppAsyncButton :onClick="handleSaveData">
  Save Changes
</AppAsyncButton>
```
