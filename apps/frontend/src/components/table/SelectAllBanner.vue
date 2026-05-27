<template>
  <div
    v-if="mode !== 'none'"
    class="rounded bg-primary-10 p-2 text-center text-sm"
  >
    <div v-if="mode === 'select-all'">
      {{
        t('common.table.selectAllBanner.pageSelected', {
          count: n(pageSelectedCount),
        })
      }}

      <button
        class="font-semibold text-link"
        @click="$emit('select-all-global')"
      >
        {{
          t('common.table.selectAllBanner.selectAll', {
            count: n(total),
          })
        }}
      </button>
    </div>

    <div v-else-if="mode === 'clear-selection'">
      {{
        t('common.table.selectAllBanner.allSelected', {
          count: n(total),
        })
      }}

      <button class="font-semibold text-link" @click="$emit('clear-selection')">
        {{ t('common.table.selectAllBanner.clearSelection') }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

const { t, n } = useI18n();

defineProps<{
  mode: 'none' | 'select-all' | 'clear-selection';
  total: number;
  pageSelectedCount: number;
}>();

defineEmits<{
  'select-all-global': [];
  'clear-selection': [];
}>();
</script>
