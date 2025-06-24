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
    url: '/products/amazing-widget',
    baseUrl: 'https://store.example.com',
    shareText: 'Share product',
    copyText: 'Copy product link',
    addressText: 'Share this product:',
    servicesText: 'Tell others about this product:',
    emailText: 'Send via email',
  },
  {
    title: 'Event',
    url: '/events/community-meetup-2024',
    baseUrl: 'https://events.community.org',
    shareText: 'Share event',
    copyText: 'Copy event link',
    addressText: 'Invite others to this event:',
    servicesText: 'Share on your social networks:',
    emailText: 'Email invitation',
  },
];
</script>

<template>
  <Story title="Utility/AppShareBox">
    <Variant title="Playground">
      <div class="max-w-2xl">
        <AppShareBox
          :url="state.url"
          :base-url="state.baseUrl"
          :share-text="state.shareText"
          :copy-text="state.copyText"
          :address-text="state.addressText"
          :services-text="state.servicesText"
          :email-text="state.emailText"
          @copied="(url) => console.log(`Copied to clipboard: ${url}`)"
          @copy-error="
            (error) => console.error(`Copy failed: ${error.message}`)
          "
        />
      </div>

      <template #controls>
        <HstText v-model="state.url" title="URL" />
        <HstText v-model="state.baseUrl" title="Base URL" />
        <HstText v-model="state.shareText" title="Share Text" />
        <HstText v-model="state.copyText" title="Copy Text" />
        <HstText v-model="state.addressText" title="Address Text" />
        <HstText v-model="state.servicesText" title="Services Text" />
        <HstText v-model="state.emailText" title="Email Text" />
      </template>
    </Variant>

    <Variant title="Default Configuration">
      <div class="max-w-2xl">
        <AppShareBox
          url="/my-page"
          base-url="https://example.com"
          share-text="Share"
          copy-text="Copy"
          address-text="Share this address:"
          services-text="Or share via social media:"
          email-text="Email"
        />
      </div>
    </Variant>

    <Variant title="Real-world Examples">
      <div class="space-y-8">
        <div v-for="(example, index) in examples" :key="index">
          <h4 class="mb-4 text-lg font-medium">{{ example.title }}</h4>
          <div class="max-w-2xl">
            <AppShareBox
              :url="example.url"
              :base-url="example.baseUrl"
              :share-text="example.shareText"
              :copy-text="example.copyText"
              :address-text="example.addressText"
              :services-text="example.servicesText"
              :email-text="example.emailText"
              @copied="
                (url) => console.log(`${example.title} link copied:`, url)
              "
              @copy-error="
                (error) => console.error(`${example.title} copy failed:`, error)
              "
            />
          </div>
        </div>
      </div>
    </Variant>

    <Variant title="Different URL Formats">
      <div class="space-y-6">
        <div>
          <h5 class="mb-2 font-medium">Absolute URL</h5>
          <div class="max-w-2xl">
            <AppShareBox
              url="/about"
              base-url="https://mywebsite.com"
              share-text="Share about page"
              copy-text="Copy"
              address-text="Share our about page:"
              services-text="Tell others about us:"
              email-text="Email"
            />
          </div>
        </div>

        <div>
          <h5 class="mb-2 font-medium">Deep Link</h5>
          <div class="max-w-2xl">
            <AppShareBox
              url="/articles/technology/ai-future"
              base-url="https://blog.tech.com"
              share-text="Share article"
              copy-text="Copy link"
              address-text="Share this tech article:"
              services-text="Discuss on social media:"
              email-text="Email article"
            />
          </div>
        </div>

        <div>
          <h5 class="mb-2 font-medium">With Query Parameters</h5>
          <div class="max-w-2xl">
            <AppShareBox
              url="/search?q=javascript&category=tutorials"
              base-url="https://learning.dev"
              share-text="Share search"
              copy-text="Copy search"
              address-text="Share these search results:"
              services-text="Share your findings:"
              email-text="Email results"
            />
          </div>
        </div>
      </div>
    </Variant>

    <Variant title="Accessibility Features">
      <div class="max-w-2xl">
        <div class="bg-blue-50 mb-4 rounded p-4">
          <h4 class="text-blue-900 mb-2 font-medium">Accessibility Features</h4>
          <ul class="text-blue-800 space-y-1 text-sm">
            <li>• Keyboard navigation with Tab, Enter, and Space</li>
            <li>• ARIA labels for screen readers</li>
            <li>• Semantic HTML structure with sections and navigation</li>
            <li>• Focus indicators on all interactive elements</li>
            <li>• Clear text descriptions for each sharing option</li>
            <li>• Color contrast compliant design</li>
          </ul>
        </div>

        <AppShareBox
          url="/accessibility-demo"
          base-url="https://inclusive.design"
          share-text="Share accessibility demo"
          copy-text="Copy demo link"
          address-text="Share this accessibility demonstration:"
          services-text="Help spread awareness about inclusive design:"
          email-text="Email demo"
        />

        <div class="mt-4 text-sm text-body-80">
          <p>
            Try navigating this component using only your keyboard (Tab, Enter,
            Space keys)
          </p>
        </div>
      </div>
    </Variant>

    <Variant title="Event Handling">
      <div class="max-w-2xl">
        <div class="bg-green-50 mb-4 rounded p-4">
          <h4 class="text-green-900 mb-2 font-medium">Event Demonstrations</h4>
          <p class="text-green-800 text-sm">
            Click the copy button to see success/error event handling in the
            browser console.
          </p>
        </div>

        <AppShareBox
          url="/event-demo"
          base-url="https://demo.events.com"
          share-text="Test events"
          copy-text="Copy & test"
          address-text="Test the copy functionality:"
          services-text="Events are logged to console:"
          email-text="Email"
          @copied="
            (url) => {
              console.log('✅ Copy success event:', url);
              console.log('Link copied successfully!');
            }
          "
          @copy-error="
            (error) => {
              console.error('❌ Copy error event:', error);
              console.error('Copy failed: ' + error.message);
            }
          "
        />
      </div>
    </Variant>
  </Story>
</template>
