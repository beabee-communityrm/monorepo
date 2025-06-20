<script lang="ts" setup>
import { reactive } from 'vue';

import { AppButton } from '../button';
import PageTitle from './PageTitle.vue';

const state = reactive({
  title: 'Dashboard',
  border: true,
  noCollapse: false,
});
</script>

<template>
  <Story title="Layout/PageTitle">
    <Variant title="Playground">
      <div class="max-w-2xl">
        <PageTitle
          :title="state.title"
          :border="state.border"
          :noCollapse="state.noCollapse"
        >
          <AppButton>Action</AppButton>
        </PageTitle>
      </div>
      <template #controls>
        <HstText v-model="state.title" title="Title" />
        <HstCheckbox v-model="state.border" title="Border" />
        <HstCheckbox
          v-model="state.noCollapse"
          title="No Collapse (always visible)"
        />
      </template>
    </Variant>

    <Variant title="With Border">
      <PageTitle title="With Border" :border="true">
        <AppButton>Action</AppButton>
      </PageTitle>
    </Variant>

    <Variant title="Without Border">
      <PageTitle title="No Border" :border="false">
        <AppButton>Action</AppButton>
      </PageTitle>
    </Variant>

    <Variant title="Collapsible Title (hidden on mobile)">
      <PageTitle title="Collapsible" :noCollapse="false">
        <AppButton>Action</AppButton>
      </PageTitle>
    </Variant>

    <Variant title="Always Visible Title (noCollapse)">
      <PageTitle title="Always Visible" :noCollapse="true">
        <AppButton>Action</AppButton>
      </PageTitle>
    </Variant>

    <Variant title="With Slot Content">
      <PageTitle title="With Slot">
        <AppButton>Danger Action</AppButton>
        <AppButton variant="dangerOutlined" class="ml-2">Danger</AppButton>
      </PageTitle>
    </Variant>
  </Story>
</template>
