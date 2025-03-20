<script lang="ts" setup>
import { ref, reactive } from 'vue';
import AppCopyButton from './AppCopyButton.vue';

const state = reactive({
  text: 'Copy this text',
});

const copyCount = ref(0);

function handleCopy() {
  copyCount.value++;
}
</script>

<template>
  <Story title="Components/Button/AppCopyButton">
    <Variant title="Playground">
      <div class="flex flex-col gap-4">
        <div class="flex items-center rounded border">
          <input
            v-model="state.text"
            class="flex-1 border-none px-2 py-2 focus:outline-none"
            type="text"
          />
          <div class="h-10 border-l border-primary-40">
            <AppCopyButton :text="state.text" @copy="handleCopy" />
          </div>
        </div>

        <div class="text-sm text-grey-dark">
          <p>Copy count: {{ copyCount }}</p>
        </div>
      </div>

      <template #controls>
        <HstText v-model="state.text" title="Text to Copy" />
      </template>
    </Variant>

    <Variant title="In Input Field">
      <div class="flex flex-col gap-4">
        <div class="flex items-center rounded border">
          <span
            class="flex-0 border-r border-primary-40 bg-grey-lighter px-2 py-2"
          >
            https://
          </span>
          <input
            value="example.com/my-page"
            class="flex-1 border-none px-2 py-2 focus:outline-none"
            type="text"
            readonly
          />
          <div class="h-10 border-l border-primary-40">
            <AppCopyButton text="https://example.com/my-page" />
          </div>
        </div>
      </div>
    </Variant>

    <Variant title="With Different Content">
      <div class="flex flex-col gap-4">
        <div class="flex items-center rounded border">
          <input
            value="API Key: 1234-5678-9012-3456"
            class="flex-1 border-none px-2 py-2 focus:outline-none"
            type="text"
            readonly
          />
          <div class="h-10 border-l border-primary-40">
            <AppCopyButton text="API Key: 1234-5678-9012-3456" />
          </div>
        </div>

        <div class="flex items-center rounded border">
          <textarea
            class="flex-1 resize-none border-none px-2 py-2 focus:outline-none"
            rows="3"
            readonly
          >
This is a longer text
that spans multiple lines
and can be copied with a single click.</textarea
          >
          <div class="h-full border-l border-primary-40">
            <AppCopyButton
              text="This is a longer text
that spans multiple lines
and can be copied with a single click."
            />
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
