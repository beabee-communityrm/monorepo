<template>
  <div>
    <span
      class="mb-1 mr-1 inline-block h-10 w-10 rounded-full align-middle"
      :class="name"
    />
    {{ shade }}
  </div>
</template>
<script lang="ts" setup>
defineProps({
  name: {
    required: true,
    type: String,
  },
  shade: {
    required: true,
    type: String,
  },
});
</script>
