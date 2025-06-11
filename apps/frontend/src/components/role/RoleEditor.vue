<template>
  <ItemManager
    :items="roles"
    :item-to-data="roleToFormData"
    :add-button-text="t('roleEditor.add')"
    :delete-title="t('roleEditor.confirmDelete.title')"
    :delete-text="() => t('roleEditor.confirmDelete.text')"
    @add="handleUpsert"
    @update="(item, data) => handleUpsert(data)"
    @delete="(role) => onDelete?.(role.role)"
  >
    <template #view="{ item }">
      <AppRoundBadge :type="isRoleCurrent(item) ? 'success' : 'danger'" />
      <strong class="mx-2 font-bold uppercase text-body-80">
        {{ t(`common.role.${item.role}`) }}
      </strong>
      <span>
        {{ formatLocale(item.dateAdded, 'P') + ' → ' }}
        {{
          item.dateExpires
            ? formatLocale(item.dateExpires, 'P')
            : t('roleEditor.today')
        }}
      </span>
    </template>

    <template #form="{ data, mode }">
      <AppSelect
        v-if="mode === 'add'"
        v-model="data.role"
        :label="t('roleEditor.new')"
        :items="roleItems"
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
import {
  type ContactRoleData,
  type RoleType,
  RoleTypes,
} from '@beabee/beabee-common';
import { AppInput } from '@beabee/vue';
import { AppSelect } from '@beabee/vue';
import { AppLabel, AppRadioGroup } from '@beabee/vue/components';

import AppRoundBadge from '@components/AppRoundBadge.vue';
import ItemManager from '@components/item-manager/ItemManager.vue';
import { formatLocale } from '@utils/dates';
import { format } from 'date-fns';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  roles: ContactRoleData[];
  onUpdate?: (roleType: RoleType, role: ContactRoleData) => Promise<void>;
  onDelete?: (roleType: RoleType) => Promise<void>;
}>();

const { t } = useI18n();

const roleItems = computed(() => {
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

function isRoleCurrent(role: ContactRoleData): boolean {
  const now = new Date();
  return role.dateAdded < now && (!role.dateExpires || role.dateExpires > now);
}

interface ContactRoleFormData {
  role: RoleType | '';
  startDate: string;
  startTime: string;
  hasStartDate: boolean;
  endDate: string;
  endTime: string;
  hasEndDate: boolean;
}

async function handleUpsert(data: ContactRoleFormData) {
  if (!data.role) return; // Can't submit without a role

  await props.onUpdate?.(data.role, {
    role: data.role,
    dateAdded: data.hasStartDate
      ? new Date(data.startDate + 'T' + data.startTime)
      : new Date(),
    dateExpires: data.hasEndDate
      ? new Date(data.endDate + 'T' + data.endTime)
      : null,
  });
}

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
