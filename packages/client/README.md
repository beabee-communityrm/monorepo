# Beabee Client

The Beabee Client is a versatile library designed to facilitate easy interaction
with the Beabee API.

## Installation

```bash
npm install @beabee/client
```

## Usage

### Example

```typescript
import { BeabeeClient } from '@beabee/client';

const client = new BeabeeClient({
  path: '/api/1.0/',
  host: 'http://localhost:3002',
  token: 'your-api-token',
});

// Get by slug or ID
const callout = await client.callout.get('my-callout-slug');

// Get with relations
const calloutWithForm = await client.callout.get('my-callout-slug', ['form']);

// Basic listing
const callouts = await client.callout.list();

// List with query filters
const activeCallouts = await client.callout.list({
  rules: {
    condition: 'AND',
    rules: [
      { field: 'status', operator: 'equal', value: ['Open'] },
      { field: 'hidden', operator: 'equal', value: [false] },
    ],
  },
  limit: 10,
  sort: 'title',
});

const newCallout = await client.callout.create({
  title: 'My New Callout',
  slug: 'my-new-callout',
  excerpt: 'A brief description',
  body: 'The full callout content',
  starts: new Date(),
  expires: null,
  // ... other creation fields
});

// Create a response for a specific callout
const response = await client.callout.response.create('my-callout-slug', {
  // Guest information
  guestName: 'John Doe',
  guestEmail: 'john@example.com',

  // Form answers
  answers: {
    question1: 'Answer 1',
    question2: 'Answer 2',
    // ... more answers based on the callout form schema
  },
});

// Get content by ID
const content = await client.content.get('content-id');

// Update content by ID
const updatedContent = await client.content.update('content-id', {
  // Partial content update
  title: 'Updated Title',
  body: 'Updated content',
});
```

## Development

To build the client, run the following task in the `beabee-client` directory:

```bash
# Build the client for all platforms
deno task build

# Build the client for Node.js
deno task build:node

# Build the client for the browser
deno task build:web
```

## Contribution and Feedback

Contributions to the client, in terms of code, bug reports, or feature
suggestions, are always welcome. Please refer to the project's contribution
guidelines for more information.

Stay tuned for updates on the expansion of the client to other platforms. Your
feedback and suggestions are valuable in guiding the development process.

## License

This project is licensed under the Apache License 2.0. This license is a
permissive open-source license, allowing the use, modification, and distribution
of the software for any purpose, without concern about copyright infringement.
It also provides an express grant of patent rights from contributors to users.

For more details, see https://www.apache.org/licenses/LICENSE-2.0.html.
