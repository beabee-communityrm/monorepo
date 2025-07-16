<script lang="ts" setup>
import { reactive, ref } from 'vue';

import { AppInput } from '../form';
import ItemManager from './ItemManager.vue';
import ItemManagerForm from './ItemManagerForm.vue';
import ItemManagerItem from './ItemManagerItem.vue';

interface Tag {
  id: string;
  name: string;
}

interface TagFormData {
  name: string;
}

// Sample data
const tags = ref<Tag[]>([
  { id: '1', name: 'Important' },
  { id: '2', name: 'Urgent' },
  { id: '3', name: 'Follow Up' },
]);

// State for playground variant
const state = reactive({
  addButtonText: 'Add Tag',
  deleteTitle: 'Delete Tag',
});

// State for form component variant
const formState = reactive({
  mode: 'add' as 'add' | 'update',
  buttonText: 'Save Tag',
  resetButtonText: 'Cancel',
});

// State for item component variant
const itemState = reactive({
  deleteTitle: 'Delete Tag',
  deleteText: 'Are you sure you want to delete this tag?',
});

const sampleTag = reactive({
  id: '1',
  name: 'Sample Tag',
});

const formData = reactive<TagFormData>({
  name: '',
});

function tagToFormData(tag?: Tag): TagFormData {
  return reactive({
    name: tag?.name || '',
  });
}

function getDeleteText(tag: Tag): string {
  return `Are you sure you want to delete "${tag.name}"?`;
}

async function handleAdd(data: TagFormData) {
  const newTag = {
    id: Date.now().toString(),
    name: data.name,
  };
  tags.value.push(newTag);
  console.log('Added tag:', newTag);
}

async function handleUpdate(tag: Tag, data: TagFormData) {
  const index = tags.value.findIndex((t) => t.id === tag.id);
  if (index !== -1) {
    tags.value[index] = { ...tag, name: data.name };
    console.log('Updated tag:', tags.value[index]);
  }
}

async function handleDelete(tag: Tag) {
  const index = tags.value.findIndex((t) => t.id === tag.id);
  if (index !== -1) {
    tags.value.splice(index, 1);
    console.log('Deleted tag:', tag);
  }
}

async function handleFormSave(data: TagFormData) {
  console.log('Form saved:', data);
  formData.name = '';
}

function handleFormCancel() {
  console.log('Form cancelled');
  formData.name = '';
}

async function handleItemUpdate(data: TagFormData) {
  sampleTag.name = data.name;
  console.log('Item updated:', data);
}

async function handleItemDelete() {
  console.log('Item deleted:', sampleTag);
}
</script>

<template>
  <Story title="Item Manager/ItemManager">
    <Variant title="Playground">
      <div class="max-w-md">
        <ItemManager
          :items="tags"
          :item-to-data="tagToFormData"
          :add-button-text="state.addButtonText"
          :delete-title="state.deleteTitle"
          :delete-text="getDeleteText"
          @add="handleAdd"
          @update="handleUpdate"
          @delete="handleDelete"
        >
          <template #view="{ item }">
            <strong class="font-bold text-body-80">{{ item.name }}</strong>
          </template>

          <template #form="{ data }">
            <div class="mb-4">
              <AppInput v-model="data.name" label="Tag Name" required />
            </div>
          </template>
        </ItemManager>
      </div>

      <template #controls>
        <HstText v-model="state.addButtonText" title="Add Button Text" />
        <HstText v-model="state.deleteTitle" title="Delete Title" />
      </template>
    </Variant>

    <Variant title="Read Only Mode">
      <div class="max-w-md">
        <ItemManager
          :items="tags"
          :item-to-data="tagToFormData"
          add-button-text="Add Tag"
          delete-title="Delete Tag"
          :delete-text="getDeleteText"
          no-update
          @add="handleAdd"
          @delete="handleDelete"
        >
          <template #view="{ item }">
            <strong class="font-bold text-body-80">{{ item.name }}</strong>
          </template>

          <template #form="{ data }">
            <div class="mb-4">
              <AppInput v-model="data.name" label="Tag Name" required />
            </div>
          </template>
        </ItemManager>
      </div>
    </Variant>

    <Variant title="ItemManagerForm Component">
      <div class="max-w-md rounded border p-4">
        <h3 class="mb-4 text-lg font-semibold">Standalone Form Component</h3>
        <ItemManagerForm
          :mode="formState.mode"
          :data="formData"
          :button-text="formState.buttonText"
          :reset-button-text="formState.resetButtonText"
          @save="handleFormSave"
          @cancel="handleFormCancel"
        >
          <template #default="{ data, mode }">
            <div class="mb-4">
              <AppInput v-model="data.name" label="Tag Name" required />
            </div>
            <p class="text-gray-600 text-sm">
              Current mode: <strong>{{ mode }}</strong>
            </p>
          </template>
        </ItemManagerForm>
      </div>

      <template #controls>
        <HstSelect
          v-model="formState.mode"
          title="Form Mode"
          :options="[
            { label: 'Add Mode', value: 'add' },
            { label: 'Update Mode', value: 'update' },
          ]"
        />
        <HstText v-model="formState.buttonText" title="Button Text" />
        <HstText
          v-model="formState.resetButtonText"
          title="Reset Button Text"
        />
      </template>
    </Variant>

    <Variant title="ItemManagerItem Component">
      <div class="max-w-md">
        <h3 class="mb-4 text-lg font-semibold">Standalone Item Component</h3>
        <ItemManagerItem
          :item="sampleTag"
          :item-to-data="tagToFormData"
          :delete-title="itemState.deleteTitle"
          :delete-text="itemState.deleteText"
          :no-update="false"
          @update="handleItemUpdate"
          @delete="handleItemDelete"
        >
          <template #view>
            <strong class="font-bold text-body-80">{{ sampleTag.name }}</strong>
            <span class="text-gray-500 ml-2 text-sm"
              >(ID: {{ sampleTag.id }})</span
            >
          </template>

          <template #form="{ data, mode }">
            <div class="mb-4">
              <AppInput v-model="data.name" label="Tag Name" required />
            </div>
            <p class="text-gray-600 text-sm">
              Editing mode: <strong>{{ mode }}</strong>
            </p>
          </template>
        </ItemManagerItem>
      </div>

      <template #controls>
        <HstText v-model="sampleTag.name" title="Tag Name" />
        <HstText v-model="itemState.deleteTitle" title="Delete Title" />
        <HstText v-model="itemState.deleteText" title="Delete Text" />
      </template>
    </Variant>

    <Variant title="Read Only Item">
      <div class="max-w-md">
        <h3 class="mb-4 text-lg font-semibold">Read-Only Item (No Update)</h3>
        <ItemManagerItem
          :item="sampleTag"
          :item-to-data="tagToFormData"
          delete-title="Delete Tag"
          delete-text="Are you sure you want to delete this read-only tag?"
          :no-update="true"
          @delete="handleItemDelete"
        >
          <template #view>
            <strong class="font-bold text-body-80">{{ sampleTag.name }}</strong>
            <span class="bg-gray-200 ml-2 rounded px-2 py-1 text-xs"
              >Read Only</span
            >
          </template>

          <template #form="{ data, mode }">
            <div class="mb-4">
              <AppInput v-model="data.name" label="Tag Name" required />
            </div>
          </template>
        </ItemManagerItem>
      </div>
    </Variant>
  </Story>
</template>
