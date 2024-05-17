<template>
  <div>
    <RoleEditorItem
      v-for="role in roles"
      :key="role.role"
      :role="role"
      @delete="emit('delete', $event)"
      @update="emit('update', $event)"
    />

    <template v-if="availableRoles.length > 0">
      <div
        v-if="formVisible"
        class="rounded rounded-t-none border border-primary-20 bg-primary-10 p-4"
      >
        <AppSubHeading>
          {{ t('roleEditor.addNewRole') }}
        </AppSubHeading>
        <RoleEditorForm
          :available-roles="availableRoles"
          @cancel="formVisible = false"
          @save="handleSaveNew"
        />
      </div>
      <AppButton
        v-else
        class="w-full"
        variant="primaryOutlined"
        @click="formVisible = true"
      >
        {{ t('roleEditor.add') }}
      </AppButton>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { RoleTypes } from '@beabee/beabee-common';

import AppButton from '@components/button/AppButton.vue';
import AppSubHeading from '@components/AppSubHeading.vue';

import RoleEditorItem from './RoleEditorItem.vue';
import RoleEditorForm from './RoleEditorForm.vue';

import type { ContactRoleData } from '@type';

const emit = defineEmits(['delete', 'update']);
const props = defineProps<{ roles: ContactRoleData[] }>();

const { t } = useI18n();

const formVisible = ref(false);

const availableRoles = computed(() =>
  RoleTypes.filter((type) => props.roles.every((role) => role.role !== type))
);

async function handleSaveNew(role: ContactRoleData) {
  formVisible.value = false;
  emit('update', role);
}
</script>
