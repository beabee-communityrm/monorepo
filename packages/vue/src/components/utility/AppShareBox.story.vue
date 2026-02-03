<script lang="ts" setup>
import { reactive } from 'vue';

import AppShareBox from './AppShareBox.vue';

const state = reactive({
  url: 'https://example.com/example-page',
});

const examples = [
  {
    title: 'Blog Post',
    url: 'https://myblog.com/blog/my-awesome-post',
  },
  {
    title: 'Product Page',
    url: 'https://mystore.com/products/awesome-widget',
  },
  {
    title: 'Event',
    url: 'https://events.example.com/events/tech-conference-2024',
  },
];
</script>

<template>
  <Story title="Utility/AppShareBox">
    <Variant title="Default" :init-state="() => state">
      <template #default="{ state }">
        <div class="max-w-md">
          <AppShareBox :url="state.url" />
        </div>
      </template>

      <template #controls="{ state }">
        <HstText v-model="state.url" title="URL" />
      </template>
    </Variant>

    <Variant title="Multiple Examples">
      <div class="space-y-8">
        <div v-for="(example, index) in examples" :key="index" class="max-w-md">
          <h3 class="mb-4 text-lg font-semibold">{{ example.title }}</h3>
          <AppShareBox :url="example.url" />
        </div>
      </div>
    </Variant>

    <Variant title="Long URL">
      <div class="max-w-md">
        <AppShareBox
          url="https://very-long-domain-name.example.com/very-long-url-path/that-might-wrap/to-multiple-lines/and-test-responsive-behavior"
        />
      </div>
    </Variant>

    <Variant title="Minimal Text">
      <div class="max-w-md">
        <AppShareBox url="https://ex.co/short" />
      </div>
    </Variant>
  </Story>
</template>
