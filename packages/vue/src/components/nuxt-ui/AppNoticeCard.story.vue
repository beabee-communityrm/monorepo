<script lang="ts" setup>
import { reactive } from 'vue';

import AppNoticeCard from './AppNoticeCard.vue';

const state = reactive({
  icon: 'i-lucide-lock',
  title: 'Members only',
  level: 3 as 2 | 3 | 4 | 5 | 6,
  color: 'primary' as 'primary' | 'success',
  fill: 'gradient' as 'solid' | 'gradient',
});
</script>

<template>
  <Story title="Card/AppNoticeCard">
    <Variant title="Playground">
      <div class="max-w-xl">
        <AppNoticeCard
          :icon="state.icon"
          :title="state.title"
          :level="state.level"
          :color="state.color"
          :fill="state.fill"
        >
          <p class="text-sm text-muted">
            This CrowdNewsroom is open to members only. Log in or join to take
            part.
          </p>

          <template #actions>
            <UButton>Log in</UButton>
            <UButton color="primary" variant="outline">Join now</UButton>
          </template>
        </AppNoticeCard>
      </div>

      <template #controls>
        <HstText v-model="state.icon" title="Icon" />
        <HstText v-model="state.title" title="Title" />
        <HstNumber
          v-model="state.level"
          title="Heading level"
          :min="2"
          :max="6"
        />
        <HstSelect
          v-model="state.color"
          title="Colour"
          :options="['primary', 'success']"
        />
        <HstSelect
          v-model="state.fill"
          title="Fill"
          :options="['solid', 'gradient']"
        />
      </template>
    </Variant>

    <Variant title="Success, no actions">
      <div class="max-w-xl">
        <AppNoticeCard
          icon="i-lucide-circle-check"
          title="Thank you!"
          color="success"
        >
          <p class="text-sm">
            Your answer joins over a hundred others from across the region.
          </p>
          <p class="text-sm text-muted">Submitted 26 August 2026.</p>
        </AppNoticeCard>
      </div>
    </Variant>

    <Variant title="Solid fill">
      <div class="max-w-xl">
        <AppNoticeCard icon="i-lucide-lock" title="Members only" fill="solid">
          <p class="text-sm text-muted">
            This CrowdNewsroom is open to members only. To participate, please
            update your contribution.
          </p>

          <template #actions>
            <UButton>Edit my contribution</UButton>
          </template>
        </AppNoticeCard>
      </div>
    </Variant>

    <Variant title="Long body text">
      <div class="max-w-xl">
        <AppNoticeCard
          icon="i-lucide-info"
          title="A notice with a good deal more to say"
          fill="gradient"
        >
          <p class="text-sm text-muted">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </p>
        </AppNoticeCard>
      </div>
    </Variant>
  </Story>
</template>
