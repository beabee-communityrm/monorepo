# MapTiler Address Provider

## Overview

The MapTiler Address Provider is a Form.io plugin that provides address lookup and autocomplete using MapTiler's Geocoding API.

## Configuration

### Provider Registration

The MapTiler provider is automatically registered with Form.io when the formio module is imported:

```typescript:apps/frontend/src/lib/formio.ts
Formio.Providers.providers.address = {
  maptiler: MapTilerAddressProvider,
};
```

### Form Builder Integration

Address components in the form builder automatically use MapTiler:

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

### API Configuration

The provider automatically uses the MapTiler API key from environment variables:

```typescript
const providerOptions: MapTilerProviderOptions = {
  params: {
    language: "de",
    country: ["DE", "AT", "CH"],
    limit: 10,
    types: ["address", "poi", "locality"],
  },
};
```

## Form.io Integration

Address components automatically use MapTiler. No additional configuration required:

```json
{
  "type": "address",
  "key": "customerAddress",
  "label": "Customer Address"
}
```

Custom search parameters can be configured:

```json
{
  "type": "address",
  "providerOptions": {
    "params": {
      "country": ["DE"],
      "types": ["address"]
    }
  }
}
```

## Key Files

- `apps/frontend/src/lib/formio/providers/address/MapTilerAddressProvider.ts`
- `apps/frontend/src/lib/formio/providers/address/BaseAddressProvider.ts`
- `apps/frontend/src/lib/formio.ts`
- `apps/frontend/src/type/maptiler.ts`
