# AppTabCard

A card component with integrated tabs for organizing content into multiple sections, particularly useful for multilingual forms and content.

## Usage

```vue
<div class="bg-grey-lighter p-4">
  <AppTabCard v-model="selectedTab" :items="languageTabs">
    <template #default="{ selected }">
      <div v-if="selected === 'en'">English content</div>
      <div v-else-if="selected === 'de'">German content</div>
    </template>
  </AppTabCard>
</div>
```

## Props

| Prop         | Type        | Required | Description                   |
| ------------ | ----------- | -------- | ----------------------------- |
| `modelValue` | `string`    | Yes      | Currently selected tab ID     |
| `items`      | `TabItem[]` | Yes      | Array of tab items to display |

## Features

- Card container with integrated tabs
- Content area with consistent padding
- v-model support for two-way binding
- Slot API for dynamic content based on selected tab
- Designed to be used within a light gray background (`bg-grey-lighter`)

## Use Cases

### Translation Forms

Perfect for multilingual forms and content:

```vue
<div class="bg-grey-lighter p-4">
  <AppTabCard v-model="selectedLanguage" :items="languageTabs">
    <template #default="{ selected }">
      <div class="space-y-4">
        <div>
          <label class="mb-1 block text-sm font-medium">Title</label>
          <input
            type="text"
            :placeholder="`Enter title in ${selected}`"
            v-model="formData[selected].title"
          />
        </div>
      </div>
    </template>
  </AppTabCard>
</div>
```

### Form Builder Translations

Used in the form builder to manage translations for form components:

```vue
<div class="bg-grey-lighter p-4">
  <AppTabCard v-model="selectedLanguage" :items="locales">
    <template #default="{ selected }">
      <div v-for="component in components" :key="component.id">
        <h3 class="font-semibold">{{ component.label }}</h3>
        <input
          type="text"
          :placeholder="`Translate in ${selected}`"
          v-model="translations[component.id][selected]"
        />
      </div>
    </template>
  </AppTabCard>
</div>
```

### Status Views

For displaying different statuses of content:

```vue
<AppTabCard v-model="selectedStatus" :items="statusTabs">
  <template #default="{ selected }">
    <DataTable :data="getDataForStatus(selected)" />
  </template>
</AppTabCard>
```
