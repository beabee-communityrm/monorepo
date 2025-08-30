# Form Builder

## Overview

The Form Builder is a Form.io-based component that allows administrators to create dynamic forms for callouts and other data collection purposes. It automatically integrates with MapTiler for address components.

## Address Component Integration

Address components automatically use MapTiler as the provider:

```typescript:apps/frontend/src/components/form-builder/form-builder.interface.ts
address: {
  title: 'Address',
  icon: 'home',
  schema: {
    type: 'address',
    provider: 'maptiler',
  },
},
```

## Provider Registration

The MapTiler address provider is automatically registered:

```typescript:apps/frontend/src/lib/formio.ts
Formio.Providers.providers.address = {
  maptiler: MapTilerAddressProvider,
};
```

## Available Components

### Basic Components

- Text Field, Text Area, Number, Email, URL, Checkbox, Dropdown, Select Boxes, Radio

### Advanced Components

- Address (MapTiler provider), Phone Number, Currency, Date/Time, Time, Signature, File, Content

## Configuration

```typescript
export const formOpts = {
  noDefaultSubmitButton: true,
  builder: {
    custom: {
      title: "Basic",
      default: true,
      components: {
        /* Basic components */
      },
    },
    custom2: {
      title: "Advanced",
      components: {
        /* Advanced components including address */
      },
    },
  },
};
```

## Usage

```vue
<FormBuilder
  ref="formBuilderRef"
  class="callout-form-builder"
  :form="{ components: modelValue }"
  :options="formOpts"
  @change="handleChange"
/>
```

## Key Files

- `apps/frontend/src/components/form-builder/FormBuilder.vue`
- `apps/frontend/src/components/form-builder/form-builder.interface.ts`
- `apps/frontend/src/lib/formio.ts`
- `apps/frontend/src/lib/formio/providers/address/MapTilerAddressProvider.ts`
