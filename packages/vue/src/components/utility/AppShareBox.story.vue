<script lang="ts" setup>
import { reactive } from 'vue';

import AppShareBox from './AppShareBox.vue';

const state = reactive({
  url: '/example-page',
  baseUrl: 'https://example.com',
  shareText: 'Share this page',
  copyText: 'Copy link',
  addressText: 'Share this page using the address below:',
  servicesText: 'Or share via social media:',
  emailText: 'Email',
});

const examples = [
  {
    title: 'Blog Post',
    url: '/blog/my-awesome-post',
    baseUrl: 'https://myblog.com',
    shareText: 'Share this post',
    copyText: 'Copy post link',
    addressText: 'Share this blog post with your friends:',
    servicesText: 'Spread the word on social media:',
    emailText: 'Email',
  },
  {
    title: 'Product Page',
    url: '/products/awesome-widget',
    baseUrl: 'https://mystore.com',
    shareText: 'Share this product',
    copyText: 'Copy product link',
    addressText: 'Share this amazing product:',
    servicesText: 'Tell your friends about this product:',
    emailText: 'Send via email',
  },
  {
    title: 'Event',
    url: '/events/tech-conference-2024',
    baseUrl: 'https://events.example.com',
    shareText: 'Share this event',
    copyText: 'Copy event link',
    addressText: 'Help us spread the word about this event:',
    servicesText: 'Share on your favorite platform:',
    emailText: 'Email invitation',
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
            :share-text="state.shareText"
            :copy-text="state.copyText"
            :address-text="state.addressText"
            :services-text="state.servicesText"
            :email-text="state.emailText"
          />
        </div>
      </template>

      <template #controls="{ state }">
        <HstText v-model="state.url" title="URL" />
        <HstText v-model="state.baseUrl" title="Base URL" />
        <HstText v-model="state.shareText" title="Share Text" />
        <HstText v-model="state.copyText" title="Copy Text" />
        <HstText v-model="state.addressText" title="Address Text" />
        <HstText v-model="state.servicesText" title="Services Text" />
        <HstText v-model="state.emailText" title="Email Text" />
      </template>
    </Variant>

    <Variant title="Multiple Examples">
      <div class="space-y-8">
        <div v-for="(example, index) in examples" :key="index" class="max-w-md">
          <h3 class="mb-4 text-lg font-semibold">{{ example.title }}</h3>
          <AppShareBox
            :url="example.url"
            :base-url="example.baseUrl"
            :share-text="example.shareText"
            :copy-text="example.copyText"
            :address-text="example.addressText"
            :services-text="example.servicesText"
            :email-text="example.emailText"
          />
        </div>
      </div>
    </Variant>

    <Variant title="Long URL">
      <div class="max-w-md">
        <AppShareBox
          url="/very-long-url-path/that-might-wrap/to-multiple-lines/and-test-responsive-behavior"
          base-url="https://very-long-domain-name.example.com"
          share-text="Share this very long URL"
          copy-text="Copy this super long link"
          address-text="This is a very long URL that should handle wrapping gracefully:"
          services-text="Share this long URL on social media:"
          email-text="Email this long link"
        />
      </div>
    </Variant>

    <Variant title="Minimal Text">
      <div class="max-w-md">
        <AppShareBox
          url="/short"
          base-url="https://ex.co"
          share-text="Share"
          copy-text="Copy"
          address-text="URL:"
          services-text="Social:"
          email-text="Mail"
        />
      </div>
    </Variant>
  </Story>
</template>
