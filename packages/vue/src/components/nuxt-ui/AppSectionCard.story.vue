<script lang="ts" setup>
import { reactive } from 'vue';

import AppSectionCard from './AppSectionCard.vue';

const state = reactive({
  icon: 'i-lucide-user-circle',
  title: 'Contact information',
  description: 'Required fields are marked with *',
});
</script>

<template>
  <Story title="Card/AppSectionCard">
    <Variant title="Playground">
      <div class="max-w-lg">
        <AppSectionCard
          :icon="state.icon"
          :title="state.title"
          :description="state.description || undefined"
        >
          <p class="text-muted text-sm">Section body content goes here.</p>
        </AppSectionCard>
      </div>

      <template #controls>
        <HstText v-model="state.icon" title="Icon" />
        <HstText v-model="state.title" title="Title" />
        <HstText v-model="state.description" title="Description" />
      </template>
    </Variant>

    <Variant title="Without description">
      <div class="max-w-lg">
        <AppSectionCard icon="i-lucide-lock" title="Change password">
          <p class="text-muted text-sm">Section body content goes here.</p>
        </AppSectionCard>
      </div>
    </Variant>

    <Variant title="Multiple sections">
      <div class="flex max-w-lg flex-col gap-6">
        <AppSectionCard
          icon="i-lucide-user-circle"
          title="Contact information"
          description="Required fields are marked with *"
        >
          <p class="text-muted text-sm">Name, email, phone fields.</p>
        </AppSectionCard>
        <AppSectionCard
          icon="i-lucide-shield-check"
          title="Two-factor authentication"
          description="Add an extra layer of security to your account"
        >
          <p class="text-muted text-sm">Enable/disable toggle.</p>
        </AppSectionCard>
      </div>
    </Variant>
  </Story>
</template>
