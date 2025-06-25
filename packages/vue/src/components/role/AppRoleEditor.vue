<!--
  # AppRoleEditor
  A component for managing contact roles with add, edit, and delete functionality.
  Allows scheduling role start/end dates and provides a visual interface for role management.

  ## Features:
  - Role management (add, edit, delete)
  - Date/time scheduling for role activation and expiration
  - Visual status indicators for active/inactive roles
  - Confirmation dialogs for destructive actions
  - Keyboard navigation support
  - Full accessibility with ARIA attributes

  ## Usage:
  ```vue
  <AppRoleEditor
    :roles="contactRoles"
    :labels="roleEditorLabels"
    @update="handleRoleUpdate"
    @delete="handleRoleDelete"
  />
  ```
-->
<template>
  <ItemManager
    :items="roles"
    :item-to-data="roleToFormData"
    :add-button-text="labels.addButtonText"
    :edit-button-text="labels.editButtonText"
    :delete-button-text="labels.deleteButtonText"
    :update-button-text="labels.updateButtonText"
    :cancel-button-text="labels.cancelButtonText"
    :no-back-button-text="labels.noBackButtonText"
    :yes-remove-button-text="labels.yesRemoveButtonText"
    :delete-title="labels.deleteTitle"
    :delete-text="() => labels.deleteText"
    @add="handleUpsert"
    @update="(item, data) => handleUpsert(data)"
    @delete="handleDelete"
  >
    <template #view="{ item }">
      <AppRoundBadge :type="isRoleCurrent(item) ? 'success' : 'danger'" />
      <strong class="mx-2 font-bold uppercase text-body-80">
        {{ getRoleLabel(item.role) }}
      </strong>
      <span>
        {{ formatRoleDate(item.dateAdded) + ' → ' }}
        {{
          item.dateExpires ? formatRoleDate(item.dateExpires) : labels.todayText
        }}
      </span>
    </template>

    <template #form="{ data, mode }">
      <AppSelect
        v-if="mode === 'add'"
        v-model="data.role"
        :label="labels.newRoleLabel"
        :items="availableRoleItems"
        required
        class="mb-4"
      />

      <div class="mb-4">
        <AppLabel :label="labels.startsLabel" required />
        <AppRadioGroup
          v-if="mode === 'add'"
          v-model="data.hasStartDate"
          :options="[
            [false, labels.startsNowOption],
            [true, labels.startsScheduleOption],
          ]"
          required
        />
        <div v-if="data.hasStartDate" class="flex gap-2">
          <div>
            <AppInput v-model="data.startDate" type="date" required />
          </div>
          <div>
            <AppInput v-model="data.startTime" type="time" required />
          </div>
        </div>
      </div>

      <div class="mb-4">
        <AppRadioGroup
          v-model="data.hasEndDate"
          :label="labels.expiresLabel"
          :options="[
            [false, labels.expiresNeverOption],
            [true, labels.expiresScheduleOption],
          ]"
          required
        />
        <div v-if="data.hasEndDate" class="flex gap-2">
          <div>
            <AppInput v-model="data.endDate" type="date" required />
          </div>
          <div>
            <AppInput v-model="data.endTime" type="time" required />
          </div>
        </div>
      </div>
    </template>
  </ItemManager>
</template>

<script lang="ts" setup>
/**
 * Role editor component for managing contact roles with scheduling capabilities.
 * Provides a comprehensive interface for adding, editing, and deleting user roles
 * with support for date/time scheduling and visual status indicators.
 *
 * @component AppRoleEditor
 */
import {
  type ContactRoleData,
  type RoleType,
  RoleTypes,
} from '@beabee/beabee-common';
import type { BaseLocale } from '@beabee/locale';
import {
  AppInput,
  AppLabel,
  AppRadioGroup,
  AppRoundBadge,
  AppSelect,
  ItemManager,
  formatLocale,
} from '@beabee/vue';

import { format } from 'date-fns';
import { computed, reactive } from 'vue';

/**
 * Interface for role editor labels/text content
 */
export interface AppRoleEditorLabels {
  /** Text for the add button */
  addButtonText: string;
  /** Text for the edit button */
  editButtonText: string;
  /** Text for the delete button */
  deleteButtonText: string;
  /** Text for the update button */
  updateButtonText: string;
  /** Text for the cancel button */
  cancelButtonText: string;
  /** Text for the "No, go back" button */
  noBackButtonText: string;
  /** Text for the "Yes, remove" button */
  yesRemoveButtonText: string;
  /** Title for delete confirmation dialog */
  deleteTitle: string;
  /** Text for delete confirmation dialog */
  deleteText: string;
  /** Text shown for "today" in role display */
  todayText: string;
  /** Label for new role selection */
  newRoleLabel: string;
  /** Label for role start date section */
  startsLabel: string;
  /** Option text for "starts now" */
  startsNowOption: string;
  /** Option text for "schedule start" */
  startsScheduleOption: string;
  /** Label for role expiration section */
  expiresLabel: string;
  /** Option text for "never expires" */
  expiresNeverOption: string;
  /** Option text for "schedule expiration" */
  expiresScheduleOption: string;
  /** Label for member role */
  memberRoleLabel: string;
  /** Label for admin role */
  adminRoleLabel: string;
  /** Label for super admin role */
  superAdminRoleLabel: string;
}

/**
 * Props for the AppRoleEditor component
 */
export interface AppRoleEditorProps {
  /** Array of current contact roles */
  roles: ContactRoleData[];
  /** Labels and text content for the component */
  labels: AppRoleEditorLabels;
  /** Current locale for date formatting */
  locale?: BaseLocale;
}

const props = withDefaults(defineProps<AppRoleEditorProps>(), {
  locale: 'en',
});

/**
 * Events emitted by the AppRoleEditor component
 */
const emit = defineEmits<{
  /**
   * Emitted when a role is updated or added
   * @param roleType - The type of role being updated
   * @param role - The role data
   */
  update: [roleType: RoleType, role: ContactRoleData];
  /**
   * Emitted when a role is deleted
   * @param roleType - The type of role being deleted
   */
  delete: [roleType: RoleType];
}>();

/**
 * Interface for the role form data used internally
 */
interface ContactRoleFormData {
  role: RoleType | '';
  startDate: string;
  startTime: string;
  hasStartDate: boolean;
  endDate: string;
  endTime: string;
  hasEndDate: boolean;
}

/**
 * Computed list of available role items for selection
 */
const availableRoleItems = computed(() => {
  const availableRoles = RoleTypes.filter((type) =>
    props.roles.every((role) => role.role !== type)
  );

  return [
    {
      id: 'member' as const,
      label: props.labels.memberRoleLabel,
    },
    {
      id: 'admin' as const,
      label: props.labels.adminRoleLabel,
    },
    {
      id: 'superadmin' as const,
      label: props.labels.superAdminRoleLabel,
    },
  ].filter(
    (item) => !availableRoles.length || availableRoles.includes(item.id)
  );
});

/**
 * Determines if a role is currently active
 * @param role - The role to check
 * @returns True if the role is currently active
 */
function isRoleCurrent(role: ContactRoleData): boolean {
  const now = new Date();
  return role.dateAdded < now && (!role.dateExpires || role.dateExpires > now);
}

/**
 * Gets the display label for a role type
 * @param roleType - The role type
 * @returns The display label for the role
 */
function getRoleLabel(roleType: RoleType): string {
  switch (roleType) {
    case 'member':
      return props.labels.memberRoleLabel;
    case 'admin':
      return props.labels.adminRoleLabel;
    case 'superadmin':
      return props.labels.superAdminRoleLabel;
    default:
      return roleType;
  }
}

/**
 * Formats a date for display in role entries
 * @param date - The date to format
 * @returns Formatted date string
 */
function formatRoleDate(date: Date): string {
  return formatLocale(date, 'P', props.locale as any);
}

/**
 * Handles role upsert (update or insert) operations
 * @param data - The form data for the role
 */
async function handleUpsert(data: ContactRoleFormData): Promise<void> {
  if (!data.role) return; // Can't submit without a role

  emit('update', data.role, {
    role: data.role,
    dateAdded: data.hasStartDate
      ? new Date(data.startDate + 'T' + data.startTime)
      : new Date(),
    dateExpires: data.hasEndDate
      ? new Date(data.endDate + 'T' + data.endTime)
      : null,
  });
}

/**
 * Handles role deletion
 * @param role - The role to delete
 */
async function handleDelete(role: ContactRoleData): Promise<void> {
  emit('delete', role.role);
}

/**
 * Converts a role to form data for editing
 * @param role - The role to convert (undefined for new roles)
 * @returns Form data object
 */
function roleToFormData(
  role: ContactRoleData | undefined
): ContactRoleFormData {
  return reactive({
    role: role?.role || ('' as const),
    ...(role
      ? {
          startDate: format(role.dateAdded, 'yyyy-MM-dd'),
          startTime: format(role.dateAdded, 'HH:mm'),
          hasStartDate: true,
        }
      : { startDate: '', startTime: '', hasStartDate: false }),
    ...(role?.dateExpires
      ? {
          endDate: format(role.dateExpires, 'yyyy-MM-dd'),
          endTime: format(role.dateExpires, 'HH:mm'),
          hasEndDate: true,
        }
      : { endDate: '', endTime: '', hasEndDate: false }),
  });
}
</script>
