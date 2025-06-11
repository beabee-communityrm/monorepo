<script lang="ts" setup>
import { reactive, ref } from 'vue';

import AppLinkList from './AppLinkList.vue';

const state = reactive({
  links: [
    { text: 'Privacy Policy', url: 'https://example.com/privacy' },
    { text: 'Terms of Service', url: 'https://example.com/terms' },
  ],
  textLabel: 'Link Text',
  urlLabel: 'URL',
  addLabel: 'Add Link',
  placeholderLabel: 'Enter link text',
  placeholderUrl: 'https://example.com',
});

const footerLinks = reactive({
  links: [
    { text: 'About Us', url: '/about' },
    { text: 'Contact', url: '/contact' },
    { text: 'Blog', url: '/blog' },
  ],
});

const responseLinks = reactive({
  links: [
    { text: 'View Details', url: '/details/{id}' },
    { text: 'Edit Response', url: '/edit/{id}' },
  ],
});

const socialLinks = reactive({
  links: [
    { text: 'Twitter', url: 'https://twitter.com/example' },
    { text: 'Facebook', url: 'https://facebook.com/example' },
    { text: 'LinkedIn', url: 'https://linkedin.com/company/example' },
  ],
});

const emptyLinks = ref([]);
</script>

<template>
  <Story title="Components/Form/AppLinkList">
    <Variant title="Playground">
      <div class="max-w-2xl space-y-6">
        <AppLinkList
          v-model="state.links"
          :text-label="state.textLabel"
          :url-label="state.urlLabel"
          :add-label="state.addLabel"
          :placeholder-label="state.placeholderLabel"
          :placeholder-url="state.placeholderUrl"
        />

        <div class="text-sm text-grey-dark">
          <p class="font-medium">Current Links:</p>
          <ul class="mt-2 space-y-1">
            <li
              v-for="(link, index) in state.links"
              :key="index"
              class="flex justify-between"
            >
              <span>{{ link.text || '(empty)' }}</span>
              <span class="text-link">{{ link.url || '(empty)' }}</span>
            </li>
          </ul>
        </div>
      </div>

      <template #controls>
        <HstText v-model="state.textLabel" title="Text Label" />
        <HstText v-model="state.urlLabel" title="URL Label" />
        <HstText v-model="state.addLabel" title="Add Button Label" />
        <HstText v-model="state.placeholderLabel" title="Text Placeholder" />
        <HstText v-model="state.placeholderUrl" title="URL Placeholder" />
      </template>
    </Variant>

    <Variant title="Footer Links">
      <div class="max-w-2xl space-y-6">
        <div class="rounded border p-6">
          <h3 class="mb-4 text-lg font-semibold">Website Footer Links</h3>
          <p class="mb-4 text-sm text-body-80">
            Manage additional links that appear in the website footer.
          </p>

          <AppLinkList
            v-model="footerLinks.links"
            text-label="Link Text"
            url-label="URL"
            add-label="Add Footer Link"
            placeholder-label="e.g., About Us"
            placeholder-url="e.g., /about"
          />

          <div class="mt-4 rounded bg-grey-lighter p-3">
            <p class="text-xs font-medium text-grey-dark">Preview:</p>
            <div class="mt-2 flex flex-wrap gap-4">
              <a
                v-for="link in footerLinks.links"
                :key="link.url"
                :href="link.url"
                class="text-sm text-link hover:underline"
              >
                {{ link.text }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </Variant>

    <Variant title="Response Links">
      <div class="max-w-2xl space-y-6">
        <div class="rounded border p-6">
          <h3 class="mb-4 text-lg font-semibold">Callout Response Links</h3>
          <p class="mb-4 text-sm text-body-80">
            Configure additional action links that appear with each response in
            callout views. Use {id} as a placeholder for the response ID.
          </p>

          <AppLinkList
            v-model="responseLinks.links"
            text-label="Link Text"
            url-label="URL Pattern"
            add-label="Add Response Link"
            placeholder-label="e.g., View Details"
            placeholder-url="e.g., /response/{id}"
          />

          <div class="mt-4 rounded bg-grey-lighter p-3">
            <p class="text-xs font-medium text-grey-dark">
              Example for Response ID "123":
            </p>
            <div class="mt-2 space-y-1">
              <div
                v-for="link in responseLinks.links"
                :key="link.url"
                class="text-sm"
              >
                <span class="font-medium">{{ link.text }}</span>
                <span class="text-grey-dark"> → </span>
                <span class="text-link">{{
                  link.url.replace('{id}', '123')
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Variant>

    <Variant title="Social Media Links">
      <div class="max-w-2xl space-y-6">
        <div class="rounded border p-6">
          <h3 class="mb-4 text-lg font-semibold">Social Media Links</h3>
          <p class="mb-4 text-sm text-body-80">
            Add social media and external service links.
          </p>

          <AppLinkList
            v-model="socialLinks.links"
            text-label="Platform"
            url-label="Profile URL"
            add-label="Add Social Link"
            placeholder-label="e.g., Twitter"
            placeholder-url="https://twitter.com/yourhandle"
          />
        </div>
      </div>
    </Variant>

    <Variant title="Empty State">
      <div class="max-w-2xl space-y-6">
        <div class="rounded border p-6">
          <h3 class="mb-4 text-lg font-semibold">Empty Link List</h3>
          <p class="mb-4 text-sm text-body-80">
            Shows how the component behaves when no links are present.
          </p>

          <AppLinkList
            v-model="emptyLinks"
            text-label="Link Text"
            url-label="URL"
            add-label="Add First Link"
          />
        </div>
      </div>
    </Variant>
  </Story>
</template>
