# Beabee Client

The Beabee Client is a versatile library designed to facilitate easy interaction
with the Beabee API. Initially developed in Deno, the library is being crafted
with a vision to support multiple platforms including Deno, Node.js, and browser
environments.

## Getting Started

To begin working with the Beabee Client in Deno:

- Ensure Deno is installed on your system.
- Clone the repository and navigate to the `beabee-client` directory.
- Follow the setup instructions detailed in this README.

### Setup

As we also bundle the project for Node.js, Node.js is also required in addition
to Deno. So we also install the packages for Node.js:

```bash
# Install Node.js packages
npm install
```

### Building

To build the client, run the following task in the `beabee-client` directory:

```bash
# Build the client for all platforms
deno task build

# Build the client for Node.js
deno task build:node

# Build the client for the browser
deno task build:web
```

_You do not need to bundle the project for Deno._

### Testing

Just run one of the following tasks in the `beabee-client` directory:

```bash
# Run all tests
deno task test

# Run Node.js tests
deno task test:node

# Run Deno tests
deno task test:deno

# Run browser tests
deno task test:web
```

### Linting

To lint the project, run `deno lint` in the project root directory.

### Formatting

To format the project, run `deno fmt` in the project root directory.

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
