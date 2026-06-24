<template>
  <div class="rounded bg-primary-10 p-2 text-center text-sm">
    <div v-if="mode === 'explicit'">
      {{
        t('common.table.selectAllBanner.pageSelected', {
          count: n(pageSelectedCount),
        })
      }}

      <button class="font-semibold text-link" @click="mode = 'all'">
        {{
          t('common.table.selectAllBanner.selectAll', {
            count: n(totalTableItems),
          })
        }}
      </button>
    </div>

    <div v-else>
      {{
        selectedCount < totalTableItems
          ? t('common.table.selectAllBanner.someSelected', {
              count: n(selectedCount),
            })
          : t('common.table.selectAllBanner.allSelected', {
              count: n(totalTableItems),
            })
      }}

      <button class="font-semibold text-link" @click="mode = 'explicit'">
        {{ t('common.table.selectAllBanner.clearSelection') }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

const { t, n } = useI18n();

const mode = defineModel<'all' | 'explicit'>('mode', {
  required: true,
});

defineProps<{
  totalTableItems: number;
  pageSelectedCount: number;
  selectedCount: number;
}>();
</script>
