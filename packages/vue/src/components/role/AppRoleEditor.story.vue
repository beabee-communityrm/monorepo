<script lang="ts" setup>
import type { ContactRoleData } from '@beabee/beabee-common';

import { reactive, ref } from 'vue';

import type { AppRoleEditorLabels } from './AppRoleEditor.vue';
import AppRoleEditor from './AppRoleEditor.vue';

// Mock role data
const emptyRoles: ContactRoleData[] = [];

const existingRoles: ContactRoleData[] = [
  {
    role: 'member',
    dateAdded: new Date('2024-01-15'),
    dateExpires: new Date('2024-12-31'),
  },
  {
    role: 'admin',
    dateAdded: new Date('2024-02-01'),
    dateExpires: null,
  },
];

const expiredRoles: ContactRoleData[] = [
  {
    role: 'member',
    dateAdded: new Date('2023-01-15'),
    dateExpires: new Date('2023-12-31'),
  },
  {
    role: 'admin',
    dateAdded: new Date('2024-01-01'),
    dateExpires: null,
  },
];

// Labels for the component
const labels: AppRoleEditorLabels = {
  addButtonText: 'Add Role',
  editButtonText: 'Edit',
  deleteButtonText: 'Delete',
  updateButtonText: 'Update',
  cancelButtonText: 'Cancel',
  noBackButtonText: 'No, go back',
  yesRemoveButtonText: 'Yes, remove',
  deleteTitle: 'Confirm Role Removal',
  deleteText: 'Are you sure you want to remove this role?',
  todayText: 'Today',
  newRoleLabel: 'New Role',
  startsLabel: 'Role Starts',
  startsNowOption: 'Now',
  startsScheduleOption: 'Schedule',
  expiresLabel: 'Role Expires',
  expiresNeverOption: 'Never',
  expiresScheduleOption: 'Schedule',
  memberRoleLabel: 'Member',
  adminRoleLabel: 'Administrator',
  superAdminRoleLabel: 'Super Administrator',
};

// Interactive playground state
const playgroundRoles = ref<ContactRoleData[]>([
  {
    role: 'member',
    dateAdded: new Date('2024-01-15'),
    dateExpires: new Date('2024-12-31'),
  },
]);

const logState = reactive({
  actions: [] as string[],
});

function handleUpdate(roleType: any, role: ContactRoleData) {
  const existingIndex = playgroundRoles.value.findIndex(
    (r) => r.role === roleType
  );
  if (existingIndex >= 0) {
    playgroundRoles.value[existingIndex] = role;
    logState.actions.unshift(`Updated ${roleType} role`);
  } else {
    playgroundRoles.value.push(role);
    logState.actions.unshift(`Added ${roleType} role`);
  }
}

function handleDelete(roleType: any) {
  playgroundRoles.value = playgroundRoles.value.filter(
    (r) => r.role !== roleType
  );
  logState.actions.unshift(`Deleted ${roleType} role`);
}

function clearLog() {
  logState.actions = [];
}
</script>

<template>
  <Story title="Role/AppRoleEditor">
    <Variant title="Playground">
      <div class="max-w-2xl">
        <div class="mb-6">
          <h3 class="mb-2 text-lg font-semibold">Interactive Role Editor</h3>
          <AppRoleEditor
            :roles="playgroundRoles"
            :labels="labels"
            locale="en"
            @update="handleUpdate"
            @delete="handleDelete"
          />
        </div>

        <div class="rounded border border-grey-light bg-grey-lighter p-4">
          <div class="mb-2 flex items-center justify-between">
            <h4 class="font-medium">Action Log</h4>
            <button
              v-if="logState.actions.length > 0"
              class="text-sm text-primary hover:text-primary-80"
              @click="clearLog"
            >
              Clear
            </button>
          </div>
          <div
            v-if="logState.actions.length === 0"
            class="text-sm text-body-60"
          >
            No actions yet. Try adding, editing, or deleting roles above.
          </div>
          <ul v-else class="space-y-1">
            <li
              v-for="(action, index) in logState.actions.slice(0, 5)"
              :key="index"
              class="text-sm text-body-80"
            >
              {{ action }}
            </li>
          </ul>
        </div>
      </div>
    </Variant>

    <Variant title="Empty State">
      <div class="max-w-2xl">
        <h3 class="mb-2 text-lg font-semibold">No Roles</h3>
        <p class="mb-4 text-body-80">
          This shows the role editor when no roles are assigned.
        </p>
        <AppRoleEditor
          :roles="emptyRoles"
          :labels="labels"
          locale="en"
          @update="handleUpdate"
          @delete="handleDelete"
        />
      </div>
    </Variant>

    <Variant title="With Active Roles">
      <div class="max-w-2xl">
        <h3 class="mb-2 text-lg font-semibold">Active Roles</h3>
        <p class="mb-4 text-body-80">
          This shows roles with different expiration settings - one expires at
          the end of the year, one never expires.
        </p>
        <AppRoleEditor
          :roles="existingRoles"
          :labels="labels"
          locale="en"
          @update="handleUpdate"
          @delete="handleDelete"
        />
      </div>
    </Variant>

    <Variant title="With Expired Role">
      <div class="max-w-2xl">
        <h3 class="mb-2 text-lg font-semibold">Mixed Active & Expired</h3>
        <p class="mb-4 text-body-80">
          This shows how expired roles appear differently (red badge) compared
          to active ones (green badge).
        </p>
        <AppRoleEditor
          :roles="expiredRoles"
          :labels="labels"
          locale="en"
          @update="handleUpdate"
          @delete="handleDelete"
        />
      </div>
    </Variant>

    <Variant title="Different Locales">
      <div class="space-y-6">
        <div class="max-w-2xl">
          <h3 class="mb-2 text-lg font-semibold">English (Default)</h3>
          <AppRoleEditor
            :roles="existingRoles"
            :labels="labels"
            locale="en"
            @update="handleUpdate"
            @delete="handleDelete"
          />
        </div>

        <div class="max-w-2xl">
          <h3 class="mb-2 text-lg font-semibold">German Date Format</h3>
          <AppRoleEditor
            :roles="existingRoles"
            :labels="labels"
            locale="de"
            @update="handleUpdate"
            @delete="handleDelete"
          />
        </div>
      </div>
    </Variant>
  </Story>
</template>
