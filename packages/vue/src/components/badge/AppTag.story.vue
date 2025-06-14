<script lang="ts" setup>
import { reactive, ref } from 'vue';

import AppTag from './AppTag.vue';

const state = reactive({
  tagText: 'Featured',
  hasRemoveIcon: true,
});

const removeCount = ref(0);

const sampleTags = [
  'JavaScript',
  'Vue.js',
  'TypeScript',
  'Frontend',
  'Web Development',
  'CSS',
  'HTML',
  'React',
  'Node.js',
];

const categoryTags = ['Important', 'Urgent', 'Draft', 'Published', 'Archived'];

function handleRemove() {
  removeCount.value++;
}
</script>

<template>
  <Story title="Components/Badge/AppTag">
    <Variant title="Playground">
      <div class="space-y-4">
        <div class="rounded border p-4">
          <h3 class="mb-3 text-lg font-semibold">Interactive Tag</h3>
          <AppTag
            :tag="state.tagText"
            :has-remove-icon="state.hasRemoveIcon"
            @click:removeTag="handleRemove"
          />

          <p class="mt-3 text-sm text-body-80">
            Remove clicked {{ removeCount }} times
          </p>
        </div>
      </div>

      <template #controls>
        <HstText v-model="state.tagText" title="Tag Text" />
        <HstCheckbox v-model="state.hasRemoveIcon" title="Show Remove Icon" />
      </template>
    </Variant>

    <Variant title="Basic Tags">
      <div class="space-y-4">
        <div>
          <h4 class="mb-2 font-medium">Simple Tags</h4>
          <div class="flex flex-wrap gap-2">
            <AppTag
              v-for="tag in sampleTags.slice(0, 5)"
              :key="tag"
              :tag="tag"
            />
          </div>
        </div>

        <div class="bg-info-10 rounded p-3">
          <p class="text-info-80 text-sm">
            Basic tags without remove functionality, perfect for displaying
            categories or labels.
          </p>
        </div>
      </div>
    </Variant>

    <Variant title="Removable Tags">
      <div class="space-y-4">
        <div>
          <h4 class="mb-2 font-medium">Tags with Remove Button</h4>
          <div class="flex flex-wrap gap-2">
            <AppTag
              v-for="tag in categoryTags"
              :key="tag"
              :tag="tag"
              :has-remove-icon="true"
              @click:removeTag="handleRemove"
            />
          </div>
        </div>

        <div class="bg-info-10 rounded p-3">
          <p class="text-info-80 text-sm">
            Interactive tags with remove functionality. Useful for tag
            management interfaces where users can add and remove tags.
          </p>
        </div>
      </div>
    </Variant>

    <Variant title="Tag Collection">
      <div class="space-y-4">
        <div>
          <h4 class="mb-2 font-medium">All Technology Tags</h4>
          <div class="flex flex-wrap gap-2">
            <AppTag
              v-for="tag in sampleTags"
              :key="tag"
              :tag="tag"
              :has-remove-icon="true"
              @click:removeTag="handleRemove"
            />
          </div>
        </div>

        <div class="rounded bg-warning-10 p-3">
          <p class="text-warning-80 text-sm">
            <strong>Accessibility:</strong> Each remove button includes proper
            focus management and keyboard navigation support for better
            accessibility.
          </p>
        </div>
      </div>
    </Variant>

    <Variant title="Real-world Examples">
      <div class="space-y-6">
        <div>
          <h4 class="mb-2 font-medium">Article Tags</h4>
          <p class="mb-2 text-sm text-body-80">
            Tags for a blog post about web development
          </p>
          <div class="flex flex-wrap gap-2">
            <AppTag tag="Web Development" />
            <AppTag tag="JavaScript" />
            <AppTag tag="Tutorial" />
            <AppTag tag="Beginner Friendly" />
          </div>
        </div>

        <div>
          <h4 class="mb-2 font-medium">Product Categories</h4>
          <p class="mb-2 text-sm text-body-80">
            Removable tags for product filtering
          </p>
          <div class="flex flex-wrap gap-2">
            <AppTag
              tag="Electronics"
              :has-remove-icon="true"
              @click:removeTag="handleRemove"
            />
            <AppTag
              tag="Gaming"
              :has-remove-icon="true"
              @click:removeTag="handleRemove"
            />
            <AppTag
              tag="Under $100"
              :has-remove-icon="true"
              @click:removeTag="handleRemove"
            />
          </div>
        </div>

        <div>
          <h4 class="mb-2 font-medium">Status Tags</h4>
          <p class="mb-2 text-sm text-body-80">
            Status indicators for different content states
          </p>
          <div class="flex flex-wrap gap-2">
            <AppTag tag="Published" />
            <AppTag tag="Featured" />
            <AppTag tag="New" />
            <AppTag tag="Popular" />
          </div>
        </div>

        <div>
          <h4 class="mb-2 font-medium">User Selected Tags</h4>
          <p class="mb-2 text-sm text-body-80">
            Tags selected by user with ability to remove them
          </p>
          <div class="flex flex-wrap gap-2">
            <AppTag
              tag="Vue.js"
              :has-remove-icon="true"
              @click:removeTag="handleRemove"
            />
            <AppTag
              tag="TypeScript"
              :has-remove-icon="true"
              @click:removeTag="handleRemove"
            />
            <AppTag
              tag="Frontend"
              :has-remove-icon="true"
              @click:removeTag="handleRemove"
            />
            <AppTag
              tag="CSS"
              :has-remove-icon="true"
              @click:removeTag="handleRemove"
            />
          </div>
        </div>
      </div>
    </Variant>

    <Variant title="Empty State">
      <div class="space-y-4">
        <div>
          <h4 class="mb-2 font-medium">No Tags Selected</h4>
          <div class="rounded border border-dashed p-4 text-center">
            <p class="text-sm text-body-80">No tags selected</p>
            <p class="mt-1 text-xs text-body-60">
              Add tags to categorize your content
            </p>
          </div>
        </div>

        <div class="bg-info-10 rounded p-3">
          <p class="text-info-80 text-sm">
            Consider showing helpful placeholder text when no tags are present
            to guide users on how to add tags.
          </p>
        </div>
      </div>
    </Variant>
  </Story>
</template>
