# AppRoleEditor

A component for managing contact roles with comprehensive scheduling and interaction capabilities.

## Features

- **Role Management**: Add, edit, and delete user roles with confirmation dialogs
- **Date Scheduling**: Set start and end dates/times for role activation and expiration
- **Visual Status**: Clear indicators for active (green) vs expired (red) roles
- **Flexible Labeling**: All text can be customized via props for internationalization
- **Keyboard Navigation**: Full keyboard support for accessibility
- **Responsive Design**: Works well on mobile and desktop devices

## Usage

The component requires a `labels` prop with all text content and a `roles` array with current role data:

```vue
<AppRoleEditor
  :roles="contactRoles"
  :labels="roleEditorLabels"
  locale="en"
  @update="handleRoleUpdate"
  @delete="handleRoleDelete"
/>
```

## Labels Interface

All text content is provided via the `labels` prop to support internationalization:

```typescript
interface AppRoleEditorLabels {
  addButtonText: string;
  editButtonText: string;
  deleteButtonText: string;
  updateButtonText: string;
  cancelButtonText: string;
  noBackButtonText: string;
  yesRemoveButtonText: string;
  deleteTitle: string;
  deleteText: string;
  todayText: string;
  newRoleLabel: string;
  startsLabel: string;
  startsNowOption: string;
  startsScheduleOption: string;
  expiresLabel: string;
  expiresNeverOption: string;
  expiresScheduleOption: string;
  memberRoleLabel: string;
  adminRoleLabel: string;
  superAdminRoleLabel: string;
}
```

## Role Data Structure

The component works with `ContactRoleData` from `@beabee/beabee-common`:

```typescript
interface ContactRoleData {
  role: 'member' | 'admin' | 'superadmin';
  dateAdded: Date;
  dateExpires: Date | null;
}
```

## Events

- `@update`: Emitted when a role is added or modified
- `@delete`: Emitted when a role is removed

## Accessibility

The component implements comprehensive accessibility features:

- Semantic HTML structure
- ARIA labels and descriptions
- Keyboard navigation support
- Focus management
- Screen reader friendly role descriptions

## Visual States

- **Active Roles**: Display with green success badge
- **Expired Roles**: Display with red danger badge
- **Date Formatting**: Respects locale prop for date display
- **Confirmation Dialogs**: Clear destructive action confirmations

## Story Variants

1. **Playground**: Interactive example with action logging
2. **Empty State**: Shows component with no existing roles
3. **With Active Roles**: Demonstrates mixed expiration scenarios
4. **With Expired Role**: Shows visual distinction for expired roles
5. **Different Locales**: Date formatting in different locales
