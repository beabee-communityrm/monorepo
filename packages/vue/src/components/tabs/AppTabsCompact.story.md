# AppTabsCompact

A compact version of tabs designed for mobile views. Features horizontal scrolling and snap points for better touch interaction.

## Usage

```vue
<AppTabsCompact
  v-model="selectedTab"
  :items="[
    { id: 'inbox', label: 'Inbox', count: 12 },
    { id: 'sent', label: 'Sent', count: 5 },
  ]"
/>
```

## Props

| Prop         | Type        | Required | Description                   |
| ------------ | ----------- | -------- | ----------------------------- |
| `modelValue` | `string`    | Yes      | Currently selected tab ID     |
| `items`      | `TabItem[]` | Yes      | Array of tab items to display |

## Features

- Horizontal scrolling with snap points
- Compact design for mobile interfaces
- Count indicators
- v-model support for two-way binding

## Use Cases

- Mobile navigation
- Secondary navigation in responsive layouts
- When space is limited and you need to display many tabs
