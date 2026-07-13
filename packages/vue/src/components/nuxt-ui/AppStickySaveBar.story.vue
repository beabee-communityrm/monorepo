<script lang="ts" setup>
import { reactive } from 'vue';

import AppStickySaveBar from './AppStickySaveBar.vue';

const state = reactive({
  dirty: true,
});

async function handleSubmit() {
  // Simulate an in-flight save so the Save button's `loading-auto` spinner
  // is actually observable when clicking it in this story. `loading-auto`
  // relies on state UForm provides internally, hence the real <UForm>
  // below rather than a plain <form> — a plain form wouldn't demonstrate it.
  await new Promise((resolve) => setTimeout(resolve, 1000));
  state.dirty = false;
}

function handleCancel() {
  state.dirty = false;
}
</script>

<template>
  <Story title="Form/AppStickySaveBar">
    <!--
      The real component Teleports to `#sticky-bottom-banner`, a target
      provided by the frontend app's Dashboard layout. That target doesn't
      exist here, so this story provides a local stand-in with the same id,
      scoped to a `position: relative` wrapper so Teleport has somewhere to
      render into. Only one variant is used (rather than several with their
      own separate targets) since the component hardcodes that target id —
      having more than one in the DOM at once would be ambiguous.
    -->
    <Variant title="Playground" :init-state="() => state">
      <template #default="{ state }">
        <div class="relative h-40 max-w-2xl border border-dashed">
          <UForm id="story-form" :state="{}" @submit="handleSubmit">
            <p class="text-muted p-4 text-sm">
              Page content would go here — the bar below is Teleported to the
              bottom of the page, not rendered inline. Click "Save Changes" to
              see the loading state (simulated with a 1s delay), after which the
              bar disappears (as it would once the form is no longer dirty) —
              success feedback itself is the site's toast notification, shown by
              the caller, not this component.
            </p>
          </UForm>
          <div id="sticky-bottom-banner" class="absolute inset-x-0 bottom-0" />
        </div>
        <AppStickySaveBar
          v-if="state.dirty"
          form="story-form"
          @cancel="handleCancel"
        />
      </template>

      <template #controls="{ state }">
        <HstCheckbox v-model="state.dirty" title="Dirty (bar visible)" />
      </template>
    </Variant>
  </Story>
</template>
