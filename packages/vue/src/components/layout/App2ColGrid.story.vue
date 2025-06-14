<script lang="ts" setup>
import App2ColGrid from './App2ColGrid.vue';
</script>

<template>
  <Story title="Layout/App2ColGrid" :layout="{ type: 'grid', width: '100%' }">
    <Variant title="Default Layout" icon="carbon:grid">
      <template #controls>
        <HstCheckbox v-model="state.extended" title="Extended second column" />
      </template>

      <App2ColGrid :extended="state.extended">
        <template #col1>
          <div class="rounded bg-primary-10 p-4">
            <h3 class="mb-2 font-semibold">First Column</h3>
            <p class="text-sm text-body-80">
              This is the first column content. It's always visible and takes
              4/12 columns on xl+ screens, 6/12 on medium screens, and full
              width on small screens.
            </p>
          </div>
        </template>
        <template #col2>
          <div class="rounded bg-success-10 p-4">
            <h3 class="mb-2 font-semibold">Second Column</h3>
            <p class="text-sm text-body-80">
              This is the second column content. Toggle the "Extended" option to
              see how it affects the column width.
            </p>
          </div>
        </template>
      </App2ColGrid>
    </Variant>

    <Variant title="Single Column" icon="carbon:column">
      <App2ColGrid>
        <template #col1>
          <div class="rounded bg-primary-10 p-4">
            <h3 class="mb-2 font-semibold">Only First Column</h3>
            <p class="text-sm text-body-80">
              When only the first column slot is provided, the layout
              automatically adjusts to show just one column.
            </p>
          </div>
        </template>
      </App2ColGrid>
    </Variant>

    <Variant title="Extended Layout" icon="carbon:expand">
      <App2ColGrid extended>
        <template #col1>
          <div class="rounded bg-primary-10 p-4">
            <h3 class="mb-2 font-semibold">First Column</h3>
            <p class="text-sm text-body-80">Narrow first column content.</p>
          </div>
        </template>
        <template #col2>
          <div class="rounded bg-warning-10 p-4">
            <h3 class="mb-2 font-semibold">Extended Second Column</h3>
            <p class="text-sm text-body-80">
              This second column extends to take more space (xl:col-end-13) when
              the extended prop is true, making it ideal for content that needs
              more room.
            </p>
          </div>
        </template>
      </App2ColGrid>
    </Variant>
  </Story>
</template>

<script lang="ts">
export default {
  data() {
    return {
      state: {
        extended: false,
      },
    };
  },
};
</script>
