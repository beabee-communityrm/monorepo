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
    @update="handleRoleUpdate"
    @delete="handleRoleDelete"
  />
  ```
-->
<template>
  <ItemManager
    :items="roles"
    :item-to-data="roleToFormData"
    :add-button-text="t('roleEditor.add')"
    :edit-button-text="t('actions.edit')"
    :delete-button-text="t('actions.delete')"
    :update-button-text="t('actions.update')"
    :cancel-button-text="t('actions.cancel')"
    :no-back-button-text="t('actions.noBack')"
    :yes-remove-button-text="t('actions.yesRemove')"
    :delete-title="t('roleEditor.confirmDelete.title')"
    :delete-text="() => t('roleEditor.confirmDelete.text')"
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
          item.dateExpires
            ? formatRoleDate(item.dateExpires)
            : t('roleEditor.today')
        }}
      </span>
    </template>

    <template #form="{ data, mode }">
      <AppSelect
        v-if="mode === 'add'"
        v-model="data.role"
        :label="t('roleEditor.new')"
        :items="availableRoleItems"
        required
        class="mb-4"
      />

      <div class="mb-4">
        <AppLabel :label="t('roleEditor.starts.label')" required />
        <AppRadioGroup
          v-if="mode === 'add'"
          v-model="data.hasStartDate"
          :options="[
            [false, t('roleEditor.starts.opts.now')],
            [true, t('roleEditor.starts.opts.schedule')],
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
          :label="t('roleEditor.expires.label')"
          :options="[
            [false, t('roleEditor.expires.opts.never')],
            [true, t('roleEditor.expires.opts.schedule')],
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
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

/**
 * Props for the AppRoleEditor component
 */
export interface AppRoleEditorProps {
  /** Array of current contact roles */
  roles: ContactRoleData[];
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
      label: t('common.role.member'),
    },
    {
      id: 'admin' as const,
      label: t('common.role.admin'),
    },
    {
      id: 'superadmin' as const,
      label: t('common.role.superadmin'),
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
      return t('common.role.member');
    case 'admin':
      return t('common.role.admin');
    case 'superadmin':
      return t('common.role.superadmin');
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
    startDate: role ? format(role.dateAdded, 'yyyy-MM-dd') : '',
    startTime: role ? format(role.dateAdded, 'HH:mm') : '',
    hasStartDate: !!role,
    endDate: role?.dateExpires ? format(role.dateExpires, 'yyyy-MM-dd') : '',
    endTime: role?.dateExpires ? format(role.dateExpires, 'HH:mm') : '',
    hasEndDate: !!role?.dateExpires,
  });
}
</script>
