# MapTiler Address Provider

## Overview

The MapTiler Address Provider is a Form.io plugin that enables address lookup and autocomplete functionality using MapTiler's Geocoding API. It transforms MapTiler's geocoding results into Form.io-compatible address components for seamless integration with address form fields.

## Architecture

### Core Components

- **MapTilerAddressProvider**: Main provider class extending BaseAddressProvider
- **Type Definitions**: TypeScript interfaces for configuration and results
- **Result Transformation**: Converts MapTiler format to Form.io format
- **Autocomplete Integration**: Debounced search with result filtering

### Key Files

- `apps/frontend/src/lib/formio/providers/address/MapTilerAddressProvider.ts` - Main provider implementation
- `apps/frontend/src/type/maptiler.ts` - TypeScript type definitions
- `apps/frontend/src/lib/formio/providers/address/BaseAddressProvider.ts` - Base provider class

## Configuration

### Provider Registration

The provider is automatically registered with Form.io when imported:

```typescript
import { MapTilerAddressProvider } from "@lib/formio/providers/address/MapTilerAddressProvider";

// Provider is registered as 'maptiler'
```

### API Configuration

```typescript
const providerOptions: MapTilerProviderOptions = {
  params: {
    key: "your_maptiler_api_key", // Required: MapTiler API key
    language: "en", // Response language (ISO 639-1)
    country: ["DE", "AT", "CH"], // Country restrictions (optional)
    limit: 10, // Maximum results (1-50)
    types: ["address", "poi", "locality"], // Result types to include
  },
};
```

### Supported Result Types

- **address**: Street addresses with house numbers
- **poi**: Points of interest (businesses, landmarks)
- **neighbourhood**: Neighborhood or district names
- **locality**: Cities, towns, and villages (replaces deprecated 'city')
- **region**: Administrative regions and states
- **country**: Country names

> **Note**: The `city` type has been replaced with `locality` in accordance with MapTiler API specifications. Using `city` will result in 400 API errors.

## API Integration

### Search Method

The core search functionality queries MapTiler's Geocoding API:

```typescript
async search(
  query: string,
  options?: Partial<MapTilerSearchOptions>
): Promise<FormioAddressResult[]>
```

**Parameters:**

- `query`: Address search string (minimum 3 characters recommended)
- `options`: Additional search parameters (country, language, types, etc.)

**Returns:** Array of Form.io-compatible address results

### Request URL Generation

```typescript
// Example generated URL
https://api.maptiler.com/geocoding/München Hauptbahnhof.json
  ?key=your_api_key
  &language=de
  &limit=10
  &types=address,poi,city
  &country=DE,AT,CH
```

### API Response Transformation

MapTiler's feature-based response is transformed to Google Maps-compatible format:

```typescript
// MapTiler Response
{
  "features": [{
    "id": "address.123",
    "place_name": "Bayerstraße 10, 80335 München, Germany",
    "center": [11.5581, 48.1402],
    "context": [
      { "id": "postcode.80335", "text": "80335" },
      { "id": "place.münchen", "text": "München" },
      { "id": "region.bayern", "text": "Bayern" },
      { "id": "country.de", "text": "Germany" }
    ]
  }]
}

// Transformed Form.io Result
{
  "place_id": "address.123",
  "formatted_address": "Bayerstraße 10, 80335 München, Germany",
  "geometry": {
    "location": { "lat": 48.1402, "lng": 11.5581 }
  },
  "address_components": [
    { "long_name": "10", "short_name": "10", "types": ["street_number"] },
    { "long_name": "Bayerstraße", "short_name": "Bayerstraße", "types": ["route"] },
    { "long_name": "München", "short_name": "München", "types": ["locality"] },
    { "long_name": "80335", "short_name": "80335", "types": ["postal_code"] },
    { "long_name": "Germany", "short_name": "Germany", "types": ["country"] }
  ]
}
```

## Autocomplete Functionality

### Implementation

The provider uses Form.io's built-in autocomplete functionality. The `attachAutocomplete` method is implemented as a stub since Form.io handles the UI and calls the `search` method directly:

```typescript
attachAutocomplete() {
  // Form.io handles the actual autocomplete UI and dropdown
  // This method is mainly for providers that need special initialization
  // For MapTiler, the search method is sufficient as Form.io calls it directly
}
```

The core functionality is provided by the `search` method which Form.io calls automatically during user input.

### Features

- **Debounced Input**: 300ms delay to prevent excessive API calls
- **Minimum Query Length**: Requires 3+ characters before searching
- **First Result Selection**: Automatically selects the most relevant result
- **Error Handling**: Silent error handling to prevent form disruption

## Form.io Integration

### Address Component Configuration

In Form.io builder, configure an address component to use MapTiler:

```json
{
  "type": "address",
  "key": "customerAddress",
  "label": "Customer Address",
  "provider": "maptiler",
  "providerOptions": {
    "params": {
      "key": "your_maptiler_api_key",
      "language": "de",
      "country": ["DE", "AT", "CH"],
      "types": ["address"]
    }
  }
}
```

### Multiple Address Fields

Different address fields can use different configurations:

```json
{
  "components": [
    {
      "type": "address",
      "key": "homeAddress",
      "provider": "maptiler",
      "providerOptions": {
        "params": {
          "types": ["address"],
          "country": ["DE"]
        }
      }
    },
    {
      "type": "address",
      "key": "businessAddress",
      "provider": "maptiler",
      "providerOptions": {
        "params": {
          "types": ["address", "poi"],
          "country": ["DE", "AT", "CH"]
        }
      }
    }
  ]
}
```

## Error Handling

### API Key Validation

```typescript
private setMapTilerOptions() {
  if (this.options.params?.key) {
    this.apiKey = this.options.params.key;
  }
  // No API key validation here - fails silently during requests
}
```

### Request Failures

- **Network Errors**: Fetch failures are caught and logged
- **Invalid API Key**: Returns 401 error from MapTiler
- **Rate Limiting**: Returns 429 error when quota exceeded
- **Malformed Queries**: Returns empty results array

### Graceful Degradation

- **No Results**: Returns empty array, form remains functional
- **Autocomplete Errors**: Silently ignored, manual input still possible
- **Missing Components**: Filters out empty address components

## Performance Considerations

### API Optimization

- **Debounced Requests**: 300ms delay prevents excessive API calls
- **Result Limiting**: Configurable limit (default: 10 results)
- **Type Filtering**: Reduces irrelevant results and response size
- **Geographic Filtering**: Country restrictions reduce search scope

## Security Considerations

### API Key Exposure

- **Frontend Visibility**: API key is visible in client-side code
- **Domain Restrictions**: Configure MapTiler key for specific domains only
- **Rate Limiting**: Monitor usage to prevent abuse

### Data Privacy

- **User Input**: Search queries are sent to MapTiler servers
- **Location Data**: Coordinates are returned from MapTiler
- **No Personal Data**: Provider doesn't store or transmit personal information

## Troubleshooting

### Common Issues

1. **No Search Results**

   - Check API key validity
   - Verify country restrictions aren't too narrow
   - Ensure query length is sufficient (3+ characters)

2. **Autocomplete Not Working**

   - Check browser console for JavaScript errors
   - Verify Form.io address component configuration
   - Test manual search functionality first

3. **Incorrect Address Format**
   - Review address component transformation logic
   - Check if MapTiler response structure has changed
   - Verify language and country settings

### Debug Information

Enable browser developer tools to monitor:

- Network requests to MapTiler API
- Console errors from provider methods
- Form.io component initialization

## Comparison with Map Integration

| Feature              | Address Provider          | Map Integration         |
| -------------------- | ------------------------- | ----------------------- |
| **Purpose**          | Form address autocomplete | Interactive map display |
| **User Interaction** | Type to search            | Click to select         |
| **API Usage**        | Forward geocoding         | Reverse geocoding       |
| **Result Format**    | Form.io compatible        | Internal address format |
| **Integration**      | Form.io components        | Vue.js components       |

Both components work together to provide comprehensive address functionality:

- **Address Provider**: Handles form input with search suggestions
- **Map Integration**: Provides visual location selection and confirmation

## Migration Notes

### v2.0.0 (Current)

**Breaking Changes:**

- **API Types**: Replace `city` with `locality` in configuration
- **Simplified Implementation**: Removed complex `attachAutocomplete` implementation
- **Display Value**: Simplified to use only `place_name` property

**Migration Steps:**

```typescript
// Before (will cause 400 errors):
types: ["address", "poi", "city"];

// After (correct):
types: ["address", "poi", "locality"];
```

**Removed Features:**

- `alternativeDisplayValueProperty` - no longer needed
- Complex `attachAutocomplete` implementation - Form.io handles this automatically
