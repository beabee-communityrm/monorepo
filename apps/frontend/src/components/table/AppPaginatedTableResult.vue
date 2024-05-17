<template>
  <div v-if="result" class="flex flex-col items-end md:flex-row md:gap-4">
    <p class="mb-3 text-sm md:mb-0 md:flex-1">
      <i18n-t v-if="result.count > 0" :keypath="keypath">
        <template #start
          ><b>{{ n(result.offset + 1) }}</b></template
        >
        <template #end
          ><b>{{ n(result.offset + result.count) }}</b></template
        >
        <template #total
          ><b>{{ n(result.total) }}</b></template
        >
      </i18n-t>
    </p>

    <div v-if="!noLimit || totalPages > 1" class="flex gap-2">
      <template v-if="!noLimit">
        <p class="flex-1 self-center text-sm">
          <i18n-t v-if="result.count > 0" keypath="common.pageCount">
            <template #pageNumber
              ><b>{{ n(props.page + 1) }}</b></template
            >
            <template #pageTotal
              ><b>{{ n(totalPages) }}</b></template
            >
          </i18n-t>
        </p>
        <AppSelect v-model="currentLimit" :items="limits" />
      </template>
      <AppPagination
        v-if="totalPages > 1"
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import type { Paginated } from '@beabee/beabee-common';
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import AppSelect from '../forms/AppSelect.vue';
import AppPagination from '../AppPagination.vue';

const emit = defineEmits(['update:page', 'update:limit']);

const props = defineProps<{
  page: number;
  limit: number;
  result: Paginated<unknown> | undefined;
  keypath: string;
  noLimit?: boolean;
}>();

const { t, n } = useI18n();

const currentPage = computed({
  get: () => props.page,
  set: (newPage) => emit('update:page', newPage),
});

const currentLimit = computed({
  get: () => props.limit,
  set: (newLimit) => emit('update:limit', newLimit),
});

const limits = computed(() =>
  [12, 25, 50, 100].map((x) => ({
    id: x,
    label: t('common.itemsPerPage', { items: n(x) }),
  }))
);

const totalPages = computed(() =>
  props.result ? Math.ceil(props.result.total / currentLimit.value) : 0
);

watch(totalPages, () => {
  if (currentPage.value > totalPages.value - 1) {
    currentPage.value = Math.max(0, totalPages.value - 1);
  }
});
</script>
