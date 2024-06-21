# Beabee Monorepo

Welcome to the official Beabee Monorepo! This repository houses the most important components of the Beabee project, including the backend API, frontend application, and shared libraries.

## Project Structure

The Beabee Monorepo is organized into the following directories:

- `apps/` Contains the applications.
  - `frontend/`: Contains the code for the frontend application.
  - `backend/`: Contains the code for the backend API.
  - `task-runner-worker/`: Contains the code for the task runner worker.
  - `task-runner-dashboard/`: Contains the code for the task runner dashboard.
  - `cli/`: Contains the code for the CLI.

- `packages/` Contains packages used by the applications.
  - `common/`: Contains shared code and utilities used by both the frontend and backend.
  - `config/`: Contains the configuration for the application.
  - `core/`: Contains the core code for the application.
  - `locales/`: Contains the localization files for the application.
  - `models/`: Contains the TypeORM database models for the application.
  - `task-runner/`: Contains shared code for the task runner used by `task-runner-worker`, `task-runner-dashboard` and the `backend`.

- `docker/`: Contains the Docker configurations.
  - `deno-node/`: Contains the Docker configuration for the Deno + Node.js environment.
  - `workspace/`: Contains the Docker configuration for the workspace builder to build everything in the monorepo and to copy them into the application containers.

## Development Setup

To get started with local development, follow these steps:

### Prerequisites

You need the following tools installed on your machine:

- Docker >= 19.03.8
- Docker Compose >= 2
- Node.js >= 20.10.0
- Yarn >= 1.22.22
- Deno >= 1.38.1

### Initial Setup

1. Copy the example environment files:

   ```bash
   cp apps/backend/.env.example apps/backend/.env
   cp apps/frontend/.env.example apps/frontend/.env
   ```

2. Install dependencies and build the project:

   ```bash
   yarn install
   yarn build
   ```

3. Initialize and start the Docker containers:

   ```bash
   # Build all docker images
   yarn docker:build:local
   # Build the docker-compose stack
   yarn docker-compose:build
   ```

   > You can also start the containers with `yarn docker:start:local`

4. Run the development mode to watch for changes on all packages:

   ```bash
   yarn dev
   ```

## Developer Tools

Check and upgrade all dependencies:

```bash
yarn upgrade
```

Publish new versions of the library packages on NPM:

```bash
yarn publish:latest # or yarn publish:next
```

Run the format command on all packages to format the code:

```bash
yarn format
```

Visual Studio Code Workspace:

If you want to use Visual Studio Code as your code editor, you can use the provided `.vscode/beabee.code-workspace` file to open the project in a workspace. This will allow you to have a single, unified view of the project, including all the necessary settings and extensions:

```bash
code .vscode/beabee.code-workspace
```

## Backend

For detailed information on the backend setup, including database migrations and running specific tools, please refer to the [Backend README](apps/backend/README.md).

## Frontend

For detailed information on the frontend setup, including internationalization and development commands, please refer to the [Frontend README](apps/frontend/README.md).

## Common Package

The `beabee-common` package contains shared code utilized across Beabee projects, compatible with Node.js, Deno, and web browsers.
For more information, please refer to the [Common Package README](packages/common/README.md).

## Documentation

Documentation is currently limited. For more detailed guidance and documentation, please contact us directly.

## Contact Us

We're always excited to connect with our community, hear feedback, and answer any questions you might have! If you're interested in learning more about Beabee or have any questions, please feel free to reach out:

- **Issues**: [GitHub Issues](https://github.com/beabee-communityrm/beabee/issues)
- **Email**: [tech@beabee.io](mailto:tech@beabee.io)

Your input is invaluable to us as we continue to grow and improve Beabee. Don't hesitate to get in touch!

## 🤝 Advertising

This project is tested with [BrowserStack](https://www.browserstack.com). As an open-source project, we have the privilege of using BrowserStack services for free, in exchange for acknowledging their support in our repository. BrowserStack is a comprehensive cloud web and mobile testing platform, enabling developers to test their websites and mobile applications across various browsers, operating systems, and real mobile devices.

## License

The Beabee Project is licensed under the [AGPL-3.0](./LICENSE) license.
