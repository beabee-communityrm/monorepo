<script lang="ts" setup>
import AppBadge from './AppBadge.vue';
</script>

<template>
  <Story title="Badge/AppBadge" :layout="{ type: 'grid', width: 'auto' }">
    <Variant title="Text Badge" icon="carbon:tag">
      <AppBadge>New</AppBadge>
    </Variant>

    <Variant title="Number Badge" icon="carbon:number-1">
      <AppBadge>42</AppBadge>
    </Variant>

    <Variant title="Multiple Badges" icon="carbon:tag-group">
      <div class="flex gap-2">
        <AppBadge>Featured</AppBadge>
        <AppBadge>Hot</AppBadge>
        <AppBadge>3 new</AppBadge>
      </div>
    </Variant>

    <Variant title="In Context" icon="carbon:view">
      <div class="rounded border p-4">
        <div class="flex items-center gap-2">
          <h3 class="font-semibold">Product Title</h3>
          <AppBadge>Sale</AppBadge>
          <AppBadge>Limited</AppBadge>
        </div>
        <p class="mt-2 text-sm text-body-80">
          This shows how badges work alongside other content elements.
        </p>
      </div>
    </Variant>
  </Story>
</template>
