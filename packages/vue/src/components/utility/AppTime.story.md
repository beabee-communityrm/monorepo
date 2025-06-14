# AppTime

A component that displays the relative time from a date to the current time, with support for customizable text templates and localization.

## Features

- **Relative Time Display**: Shows time differences like "2 hours ago", "in 3 days"
- **Semantic HTML**: Uses the `<time>` element with proper datetime attribute
- **Accessibility**: Includes ARIA labels and title attributes for screen readers
- **Customizable Templates**: Configurable text templates for past and future dates
- **Locale Support**: Multi-language date formatting support
- **Time-only Mode**: Option to display just the relative time without prefixes/suffixes

## Props

| Prop              | Type                                           | Default        | Description                                          |
| ----------------- | ---------------------------------------------- | -------------- | ---------------------------------------------------- |
| `datetime`        | `Date \| string \| number`                     | **Required**   | Date object, ISO string, or timestamp                |
| `timeOnly`        | `boolean`                                      | `false`        | Only display relative time without prefix/suffix     |
| `timeAgoTemplate` | `string`                                       | `'{time} ago'` | Template for past dates, use {time} as placeholder   |
| `timeInTemplate`  | `string`                                       | `'in {time}'`  | Template for future dates, use {time} as placeholder |
| `locale`          | `'en' \| 'de' \| 'nl' \| 'pt' \| 'ru' \| 'it'` | `'en'`         | Locale for date formatting                           |

## Usage

### Basic Usage

```vue
<template>
  <!-- Date object -->
  <AppTime :datetime="new Date()" />

  <!-- ISO string -->
  <AppTime :datetime="'2024-01-15T10:30:00Z'" />

  <!-- Timestamp -->
  <AppTime :datetime="1705315800000" />
</template>
```

### Time Only Mode

```vue
<template>
  <AppTime :datetime="someDate" time-only />
  <!-- Output: "2 hours" (without "ago" or "in") -->
</template>
```

### Custom Templates

```vue
<template>
  <AppTime
    :datetime="someDate"
    time-ago-template="🕐 {time} before now"
    time-in-template="⏰ coming up in {time}"
  />
  <!-- Output: "🕐 2 hours before now" or "⏰ coming up in 3 days" -->
</template>
```

### With Localization

```vue
<template>
  <AppTime
    :datetime="someDate"
    locale="de"
    time-ago-template="vor {time}"
    time-in-template="in {time}"
  />
  <!-- Output: "vor 2 Stunden" or "in 3 Tagen" -->
</template>
```
