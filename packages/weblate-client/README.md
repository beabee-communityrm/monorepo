# @beabee/weblate-client

A Weblate API Client for interacting with the Weblate API.

## Overview

This package provides a client to communicate with the Weblate API. It was initially created for a temporary script (`weblate-sync.ts` in `@beabee/locale`) to synchronize translation labels. While that specific script might be removed later, this client is kept as it could be useful for future integrations with Weblate, such as uploading screenshots or other automation tasks.

### Type Definitions

The TypeScript type definitions for the Weblate API (located in `src/types/openapi.ts`) are auto-generated using `openapi-typescript`.

**Important:** The generated types might not always be entirely accurate. We've encountered instances where the generated types did not perfectly match the API's expectations, requiring manual adjustments or type assertions in the client implementation. If this client is to be used more extensively in the future, these type definitions might need further refinement or a more robust generation process.

To update the generated types, you can run the following command from the root of this package:

```bash
yarn generate
```

This command is defined in the `package.json` file.

### Build Process

This package does not require a separate build step. The TypeScript files (`.ts`) are intended to be imported directly. This approach is similar to how tool scripts are handled in the `@beabee/locale` package.

### Client Implementation

The core client logic is in `src/client.ts`. It uses `openapi-fetch` for making API requests.
To provide a more developer-friendly experience and to work around some of the aforementioned type inconsistencies, several wrapper methods have been implemented around the raw `openapi-fetch` client. These wrappers offer a cleaner interface for common API operations.

## Usage Example

Here's a brief example of how to use the `WeblateClient`, inspired by its usage in the `weblate-sync.ts` script:

```typescript
import {
  WeblateClient,
  type UnitUpdateRequestBody
} from "@beabee/weblate-client";

const client = new WeblateClient({
  baseUrl: "https://your-weblate-instance.com/api", // Replace with your Weblate API URL
  token: "your-api-token", // Replace with your Weblate API token
  project: "your-project-slug", // Replace with your project slug
  component: "your-component-slug" // Replace with your component slug
});

// Fetch translation units for a specific context in English
const translationKey = "my.translation.key";
const searchData = await client.getTranslationUnits({
  project: "your-project-slug",
  component: "your-component-slug",
  language: "en",
  q: `context:"${translationKey}"`
});

const unitsFound = searchData.results || [];

if (unitsFound.length === 0) {
  console.log(`No unit found for context: "${translationKey}"`);
  return;
}

const unit = unitsFound[0];
console.log(`Found unit: ${unit.id}, Context: ${unit.context}`);

// Example: Update labels for the found unit
// Assuming WEBLATE_LABELS.User corresponds to a valid label ID (e.g., 802)
const WEBLATE_LABELS = { User: 802 };
const labelIdsToApply = [WEBLATE_LABELS.User];

// The body for updating labels might look like this:
// const body: UnitUpdateRequestBody = {
//   labels: labelIdsToApply
// };
// await client.updateUnitLabels(unit.id, labelIdsToApply);

// Or update other unit properties:
const updateData: UnitUpdateRequestBody = {
  target: ["New translation target text"], // Example: update target text
  state: 20 // Example: set state to 'Translated'
  // labels can also be updated here if needed, using the same format as updateUnitLabels
};
// const updatedUnit = await client.updateUnit(unit.id, updateData);
// console.log("Updated unit:", updatedUnit);

console.log(
  "Example finished. Uncomment API call lines to perform actual updates."
);
```

This example demonstrates how to initialize the client and fetch translation units. Remember to replace placeholder values with your actual Weblate instance details and API credentials. The commented-out lines show how you might update unit labels or other properties.
