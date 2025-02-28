# AppAsyncButton

The `AppAsyncButton` component extends the base `AppButton` component with built-in handling for asynchronous operations. It automatically manages loading state and error notifications.

## Features

- Automatically shows loading state during async operations
- Handles errors and displays error notifications
- Passes through all AppButton props
- Simplifies handling of async operations in forms and actions

## Usage

```vue
<AppAsyncButton :onClick="handleSaveData">
  Save Changes
</AppAsyncButton>
```

## Props

| Prop      | Type                            | Default | Required | Description                                          |
| --------- | ------------------------------- | ------- | -------- | ---------------------------------------------------- |
| `onClick` | `(evt: Event) => Promise<void>` | -       | No       | Async function to execute when the button is clicked |

Additionally, all props from `AppButton` are supported (variant, icon, disabled, etc.).

## Slots

| Slot    | Description    |
| ------- | -------------- |
| default | Button content |

## Examples

### Basic Usage

```vue
<AppAsyncButton :onClick="handleSaveData">
  Save Changes
</AppAsyncButton>
```

### With Different Variants and Icons

```vue
<AppAsyncButton
  variant="primaryOutlined"
  :icon="faEye"
  :onClick="handlePreview"
>
  Preview
</AppAsyncButton>

<AppAsyncButton variant="primaryOutlined" :onClick="handleSaveDraft">
  Save Draft
</AppAsyncButton>

<AppAsyncButton variant="primary" :onClick="handlePublish">
  Publish
</AppAsyncButton>
```

### Handling Async Operations

The component automatically handles the loading state and error notifications:

```vue
<script setup>
async function handleSaveData() {
  try {
    await api.saveData();
    // Success notification can be added here
    addNotification({
      title: 'Data saved successfully',
      variant: 'success',
    });
  } catch {
    // Error notification is automatically handled by the component
  }
}
</script>

<template>
  <AppAsyncButton :onClick="handleSaveData"> Save Data </AppAsyncButton>
</template>
```

### Real-world Example

From the callout creation page:

```vue
<div class="flex items-center gap-2">
  <AppAsyncButton
    variant="primaryOutlined"
    :icon="faEye"
    :disabled="!status"
    @click="handlePreview"
  >
    {{ t('actions.preview') }}
  </AppAsyncButton>
  <div class="h-4 border-r border-r-primary-40" />
  <AppAsyncButton variant="primaryOutlined" @click="handleSaveDraft">
    {{
      isNewOrDraft ? t('actions.saveDraft') : t('actions.revertToDraft')
    }}
  </AppAsyncButton>
  <AppAsyncButton :disabled="validation.$invalid" @click="handleUpdate">
    {{ updateAction }}
  </AppAsyncButton>
</div>
```

## How It Works

The AppAsyncButton component:

1. Accepts an async function via the `onClick` prop
2. When clicked, sets its loading state to true
3. Executes the provided async function
4. If the function throws an error, displays an error notification
5. Finally, sets the loading state back to false

This pattern simplifies handling async operations in the UI by automatically managing loading states and error handling.
