<script lang="ts" setup>
import { reactive } from 'vue';

import AppShareBox from './AppShareBox.vue';

const state = reactive({
  url: '/example-page',
  baseUrl: 'https://example.com',
  addressText: 'Share this page using the address below:',
  servicesText: 'Or share via social media:',
});

const examples = [
  {
    title: 'Blog Post',
    url: '/blog/my-awesome-post',
    baseUrl: 'https://myblog.com',
    addressText: 'Share this blog post with your friends:',
    servicesText: 'Spread the word on social media:',
  },
  {
    title: 'Product Page',
    url: '/products/awesome-widget',
    baseUrl: 'https://mystore.com',
    addressText: 'Share this amazing product:',
    servicesText: 'Tell your friends about this product:',
  },
  {
    title: 'Event',
    url: '/events/tech-conference-2024',
    baseUrl: 'https://events.example.com',
    addressText: 'Help us spread the word about this event:',
    servicesText: 'Share on your favorite platform:',
  },
];
</script>

<template>
  <Story title="Utility/AppShareBox">
    <Variant title="Default" :init-state="state">
      <template #default="{ state }">
        <div class="max-w-md">
          <AppShareBox
            :url="state.url"
            :base-url="state.baseUrl"
            :address-text="state.addressText"
            :services-text="state.servicesText"
          />
        </div>
      </template>

      <template #controls="{ state }">
        <HstText v-model="state.url" title="URL" />
        <HstText v-model="state.baseUrl" title="Base URL" />
        <HstText v-model="state.addressText" title="Address Text" />
        <HstText v-model="state.servicesText" title="Services Text" />
      </template>
    </Variant>

    <Variant title="Multiple Examples">
      <div class="space-y-8">
        <div v-for="(example, index) in examples" :key="index" class="max-w-md">
          <h3 class="mb-4 text-lg font-semibold">{{ example.title }}</h3>
          <AppShareBox
            :url="example.url"
            :base-url="example.baseUrl"
            :address-text="example.addressText"
            :services-text="example.servicesText"
          />
        </div>
      </div>
    </Variant>

    <Variant title="Long URL">
      <div class="max-w-md">
        <AppShareBox
          url="/very-long-url-path/that-might-wrap/to-multiple-lines/and-test-responsive-behavior"
          base-url="https://very-long-domain-name.example.com"
          address-text="This is a very long URL that should handle wrapping gracefully:"
          services-text="Share this long URL on social media:"
        />
      </div>
    </Variant>

    <Variant title="Minimal Text">
      <div class="max-w-md">
        <AppShareBox
          url="/short"
          base-url="https://ex.co"
          address-text="URL:"
          services-text="Social:"
        />
      </div>
    </Variant>
  </Story>
</template>
