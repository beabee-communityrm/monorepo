<script lang="ts" setup>
import { reactive, ref } from 'vue';

import { AppButton } from '../button';
import AppModal from './AppModal.vue';

const state = reactive({
  open: false,
  title: 'Modal Title',
  variant: 'default' as 'default' | 'danger',
  closeButtonText: 'Close',
  showTitle: true,
});

const variants = ['default', 'danger'] as const;

const openCount = ref(0);

function openModal() {
  state.open = true;
  openCount.value++;
}

function closeModal() {
  state.open = false;
}
</script>

<template>
  <Story title="Dialog/AppModal">
    <Variant title="Playground">
      <div class="flex flex-col gap-4">
        <div class="flex gap-2">
          <AppButton @click="openModal">Open Modal</AppButton>
          <p class="text-body-60">Opened {{ openCount }} times</p>
        </div>

        <AppModal
          :open="state.open"
          :title="state.showTitle ? state.title : undefined"
          :variant="state.variant === 'default' ? undefined : state.variant"
          :close-button-text="state.closeButtonText"
          @close="closeModal"
        >
          <div class="space-y-4">
            <p>This is the modal content. You can place any content here.</p>
            <p>
              The modal supports backdrop click prevention and includes proper
              accessibility features.
            </p>
            <AppButton variant="text" @click="closeModal">
              Close from inside
            </AppButton>
          </div>
        </AppModal>
      </div>

      <template #controls>
        <HstText v-model="state.title" title="Title" />
        <HstSelect
          v-model="state.variant"
          title="Variant"
          :options="variants"
        />
        <HstText v-model="state.closeButtonText" title="Close Button Text" />
        <HstCheckbox v-model="state.showTitle" title="Show Title" />
      </template>
    </Variant>

    <Variant title="Variants">
      <div class="flex gap-4">
        <AppButton
          @click="
            () => {
              state.variant = 'default';
              openModal();
            }
          "
        >
          Open Default Modal
        </AppButton>
        <AppButton
          @click="
            () => {
              state.variant = 'danger';
              openModal();
            }
          "
        >
          Open Danger Modal
        </AppButton>
      </div>

      <AppModal
        :open="state.open"
        :title="state.title"
        :variant="state.variant === 'default' ? undefined : state.variant"
        :close-button-text="state.closeButtonText"
        @close="closeModal"
      >
        <div class="space-y-4">
          <p>This modal demonstrates the {{ state.variant }} variant.</p>
          <AppButton variant="text" @click="closeModal">
            Close from inside
          </AppButton>
        </div>
      </AppModal>
    </Variant>

    <Variant title="Without Title">
      <AppButton
        @click="
          () => {
            state.showTitle = false;
            openModal();
          }
        "
      >
        Open Modal Without Title
      </AppButton>

      <AppModal
        :open="state.open"
        :title="state.showTitle ? state.title : undefined"
        :variant="state.variant === 'default' ? undefined : state.variant"
        :close-button-text="state.closeButtonText"
        @close="closeModal"
      >
        <div class="space-y-4">
          <p>This modal has no title and demonstrates minimal setup.</p>
          <AppButton variant="text" @click="closeModal">
            Close from inside
          </AppButton>
        </div>
      </AppModal>
    </Variant>

    <Variant title="Long Content">
      <AppButton
        @click="
          () => {
            state.title = 'Modal with Long Content';
            state.showTitle = true;
            openModal();
          }
        "
      >
        Open Modal with Scrollable Content
      </AppButton>

      <AppModal
        :open="state.open"
        :title="state.title"
        :variant="state.variant === 'default' ? undefined : state.variant"
        :close-button-text="state.closeButtonText"
        @close="closeModal"
      >
        <div class="space-y-4">
          <p v-for="i in 20" :key="i">
            This is paragraph {{ i }} of long content that demonstrates the
            modal's scrollable behavior when content exceeds the viewport
            height. The modal maintains proper focus management and
            accessibility even with long content.
          </p>
        </div>
      </AppModal>
    </Variant>
  </Story>
</template>
