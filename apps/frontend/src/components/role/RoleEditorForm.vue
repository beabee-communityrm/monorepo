<template>
  <AppForm
    :button-text="role ? t('actions.update') : t('actions.add')"
    :reset-button-text="t('actions.cancel')"
    @submit="handleSubmit"
    @reset="emit('cancel')"
  >
    <AppSelect
      v-if="!role"
      v-model="data.role"
      :label="t('roleEditor.new')"
      :items="roleItems"
      required
      class="mb-4"
    />

    <div class="mb-4">
      <AppLabel :label="t('roleEditor.starts.label')" required />
      <AppRadioGroup
        v-if="!role"
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
  </AppForm>
</template>

<script lang="ts" setup>
import type { RoleType } from '@beabee/beabee-common';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { computed, reactive } from 'vue';
import { format } from 'date-fns';
import { useI18n } from 'vue-i18n';

import AppForm from '../forms/AppForm.vue';
import AppInput from '../forms/AppInput.vue';
import AppLabel from '../forms/AppLabel.vue';
import AppRadioGroup from '../forms/AppRadioGroup.vue';
import AppSelect from '../forms/AppSelect.vue';

import type { ContactRoleData } from '@type';

const { t } = useI18n();

const emit = defineEmits(['cancel', 'save']);
const props = defineProps<{
  role?: ContactRoleData;
  onSave?: (data: ContactRoleData) => Promise<void> | void;
  availableRoles?: RoleType[];
}>();

// This means no form this form is embedded into will ever validate
// while it's open, preventing unsaved changes from propogating
useVuelidate({ never: { required } }, { never: undefined });

const roleItems = computed(() =>
  [
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
    (item) =>
      !props.availableRoles?.length || props.availableRoles.includes(item.id)
  )
);

const data = reactive({
  role: props.role?.role || ('' as const),
  ...(props.role
    ? {
        startDate: format(props.role.dateAdded, 'yyyy-MM-dd'),
        startTime: format(props.role.dateAdded, 'HH:mm'),
        hasStartDate: true,
      }
    : { startDate: '', startTime: '', hasStartDate: false }),
  ...(props.role?.dateExpires
    ? {
        endDate: format(props.role.dateExpires, 'yyyy-MM-dd'),
        endTime: format(props.role.dateExpires, 'HH:mm'),
        hasEndDate: true,
      }
    : { endDate: '', endTime: '', hasEndDate: false }),
});

async function handleSubmit() {
  if (!data.role) return; // Can't submit without a role

  await props.onSave?.({
    role: data.role,
    dateAdded: data.hasStartDate
      ? new Date(data.startDate + 'T' + data.startTime)
      : new Date(),
    dateExpires: data.hasEndDate
      ? new Date(data.endDate + 'T' + data.endTime)
      : null,
  });
}
</script>
