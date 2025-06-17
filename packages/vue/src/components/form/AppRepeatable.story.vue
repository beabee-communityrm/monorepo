<script lang="ts" setup>
import { reactive } from 'vue';

import AppInput from './AppInput.vue';
import AppRepeatable from './AppRepeatable.vue';

const todoState = reactive({
  todos: [
    { task: 'Review pull requests', completed: false },
    { task: 'Update documentation', completed: true },
  ],
});

const contactState = reactive({
  contacts: [
    { name: 'John Doe', email: 'john@example.com', phone: '+1234567890' },
    { name: 'Jane Smith', email: 'jane@example.com', phone: '+0987654321' },
  ],
});

const tagState = reactive({
  tags: ['vue', 'typescript', 'forms'],
});

const emptyState = reactive({
  items: [] as Array<{ value: string }>,
});

// Factory functions for new items
const createTodo = () => ({ task: '', completed: false });
const createContact = () => ({ name: '', email: '', phone: '' });
const createTag = () => '';
const createEmptyItem = () => ({ value: '' });

const newsletterState = reactive({
  newsletters: [
    {
      name: 'Weekly Newsletter',
      description: 'Our weekly roundup of news and updates',
      defaultOptIn: true,
    },
  ],
});

const createNewsletter = () => ({
  name: '',
  description: '',
  defaultOptIn: false,
});
</script>

<template>
  <Story title="Form/AppRepeatable">
    <Variant title="Todo List Example">
      <div class="max-w-2xl space-y-6">
        <div class="rounded border p-6">
          <h3 class="mb-4 text-lg font-semibold">Todo List</h3>
          <p class="mb-4 text-sm text-body-80">
            Example of using AppRepeatable for a todo list with checkboxes.
          </p>

          <AppRepeatable
            v-model="todoState.todos"
            :new-item="createTodo"
            add-label="Add Todo"
          >
            <template #default="{ item }">
              <div class="flex flex-1 items-center gap-4">
                <input
                  v-model="item.completed"
                  type="checkbox"
                  class="rounded"
                />
                <div class="flex-1">
                  <AppInput
                    v-model="item.task"
                    placeholder="Enter task description"
                    :class="{ 'line-through': item.completed }"
                  />
                </div>
              </div>
            </template>
          </AppRepeatable>

          <div class="mt-4 text-sm text-grey-dark">
            <p>
              Completed:
              {{ todoState.todos.filter((t) => t.completed).length }} /
              {{ todoState.todos.length }}
            </p>
          </div>
        </div>
      </div>
    </Variant>

    <Variant title="Contact List Example">
      <div class="max-w-2xl space-y-6">
        <div class="rounded border p-6">
          <h3 class="mb-4 text-lg font-semibold">Contact Information</h3>
          <p class="mb-4 text-sm text-body-80">
            Example of using AppRepeatable for managing contact information with
            multiple fields.
          </p>

          <AppRepeatable
            v-model="contactState.contacts"
            :new-item="createContact"
            add-label="Add Contact"
          >
            <template #default="{ item }">
              <div class="flex-1 space-y-2">
                <AppInput
                  v-model="item.name"
                  label="Name"
                  placeholder="Full name"
                  required
                />
                <div class="grid grid-cols-2 gap-4">
                  <AppInput
                    v-model="item.email"
                    label="Email"
                    type="email"
                    placeholder="email@example.com"
                  />
                  <AppInput
                    v-model="item.phone"
                    label="Phone"
                    type="text"
                    placeholder="+1234567890"
                  />
                </div>
              </div>
            </template>
          </AppRepeatable>
        </div>
      </div>
    </Variant>

    <Variant title="Tag List Example">
      <div class="max-w-2xl space-y-6">
        <div class="rounded border p-6">
          <h3 class="mb-4 text-lg font-semibold">Tag Management</h3>
          <p class="mb-4 text-sm text-body-80">
            Example of using AppRepeatable for simple string values like tags.
          </p>

          <AppRepeatable
            v-model="tagState.tags"
            :new-item="createTag"
            add-label="Add Tag"
          >
            <template #default="{ item, index }">
              <div class="flex-1">
                <AppInput
                  :model-value="item"
                  placeholder="Tag name"
                  @update:model-value="tagState.tags[index] = $event"
                />
              </div>
            </template>
          </AppRepeatable>

          <div class="mt-4">
            <p class="text-sm font-medium text-grey-dark">Preview:</p>
            <div class="mt-2 flex flex-wrap gap-2">
              <span
                v-for="tag in tagState.tags.filter((t) => t.trim())"
                :key="tag"
                class="rounded bg-primary-20 px-2 py-1 text-xs text-primary-80"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Variant>

    <Variant title="Newsletter Settings">
      <div class="max-w-2xl space-y-6">
        <div class="rounded border p-6">
          <h3 class="mb-4 text-lg font-semibold">Newsletter Opt-in Settings</h3>
          <p class="mb-4 text-sm text-body-80">
            Example based on how AppRepeatable is used in
            NewsletterOptInSettings.
          </p>

          <AppRepeatable
            v-model="newsletterState.newsletters"
            :new-item="createNewsletter"
            add-label="Add Newsletter"
          >
            <template #default="{ item }">
              <div class="flex-1 space-y-3">
                <AppInput
                  v-model="item.name"
                  label="Newsletter Name"
                  placeholder="e.g., Weekly Updates"
                  required
                />
                <AppInput
                  v-model="item.description"
                  label="Description"
                  placeholder="Brief description of the newsletter"
                />
                <div class="flex items-center gap-2">
                  <input
                    v-model="item.defaultOptIn"
                    type="checkbox"
                    class="rounded"
                  />
                  <label class="text-sm">Default opt-in for new members</label>
                </div>
              </div>
            </template>
          </AppRepeatable>
        </div>
      </div>
    </Variant>

    <Variant title="Empty State">
      <div class="max-w-2xl space-y-6">
        <div class="rounded border p-6">
          <h3 class="mb-4 text-lg font-semibold">Empty List</h3>
          <p class="mb-4 text-sm text-body-80">
            Shows how the component behaves when no items are present.
          </p>

          <AppRepeatable
            v-model="emptyState.items"
            :new-item="createEmptyItem"
            add-label="Add First Item"
          >
            <template #default="{ item }">
              <div class="flex-1">
                <AppInput v-model="item.value" placeholder="Enter value" />
              </div>
            </template>
          </AppRepeatable>
        </div>
      </div>
    </Variant>
  </Story>
</template>
