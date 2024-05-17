<template>
  <div class="mb-3 rounded border border-primary-20 bg-primary-10">
    <div class="flex items-center bg-primary-5 px-4 py-1 text-sm">
      <AppRoundBadge :type="isRoleCurrent(role) ? 'success' : 'danger'" />
      <strong class="mx-2 font-bold uppercase text-body-80">
        {{ t(`common.role.${role.role}`) }}
      </strong>
      <span>
        {{ formatLocale(role.dateAdded, 'P') + ' → ' }}
        {{
          role.dateExpires
            ? formatLocale(role.dateExpires, 'P')
            : t('roleEditor.today')
        }}
      </span>
      <div class="-mr-3 ml-auto">
        <AppButton variant="text" size="sm" @click="formVisible = true">{{
          t('actions.edit')
        }}</AppButton>
        <AppButton
          variant="dangerText"
          size="sm"
          @click="showDeleteModal = true"
        >
          {{ t('actions.delete') }}
        </AppButton>

        <AppConfirmDialog
          :open="showDeleteModal"
          :title="t('roleEditor.confirmDelete.title')"
          :cancel="t('actions.noBack')"
          :confirm="t('actions.yesRemove')"
          variant="danger"
          @close="showDeleteModal = false"
          @confirm="emit('delete', role.role)"
        >
          <p>{{ t('roleEditor.confirmDelete.text') }}</p>
        </AppConfirmDialog>
      </div>
    </div>

    <RoleEditorForm
      v-if="formVisible"
      class="p-4"
      :role="role"
      @save="emit('update', $event)"
      @cancel="formVisible = false"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AppButton from '../button/AppButton.vue';
import AppRoundBadge from '../AppRoundBadge.vue';
import AppConfirmDialog from '../AppConfirmDialog.vue';
import RoleEditorForm from './RoleEditorForm.vue';

import { formatLocale } from '@utils/dates';

import type { ContactRoleData } from '@type';

const emit = defineEmits(['delete', 'update']);
defineProps<{ role: ContactRoleData }>();

const { t } = useI18n();
const formVisible = ref(false);
const showDeleteModal = ref(false);

function isRoleCurrent(role: ContactRoleData): boolean {
  const now = new Date();
  return role.dateAdded < now && (!role.dateExpires || role.dateExpires > now);
}
</script>
