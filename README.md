# Beabee Monorepo

Welcome to the official Beabee Monorepo! This repository houses the most important components of the Beabee project, including the backend API, frontend application, and shared libraries.

## Project Structure

The Beabee Monorepo is organized into the following directories:

- `apps/`

  - `frontend/`: Contains the code for the frontend application. See [Frontend README](apps/frontend/README.md) for more information.
  - `backend/`: Contains the code for the backend API. See [Backend README](apps/backend/README.md) for more information.
  - `router/`: Contains the code for the new frontend router. See [Router README](apps/router/README.md) for more information.

- `packages/`
  - `common/`: Contains shared code and utilities used by both the frontend and backend. See [Common Package README](packages/common/README.md) for more information.
  - `core/`: Contains shared core functionality used by the backend. See [Core Package README](packages/core/README.md) for more information.

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

1. Install dependencies and build the project:

   ```bash
   yarn install
   ```

2. Run the presetup script to copy the example environment files:

   ```bash
   yarn presetup
   ```
3. Complete the .env in your root by setting the following environment variables:

   ```bash
   BEABEE_STRIPE_PUBLICKEY=...
   BEABEE_STRIPE_SECRETKEY=...
   BEABEE_STRIPE_WEBHOOKSECRET=...
   BEABEE_STRIPE_MEMBERSHIPPRODUCTID=...
   ```

4. Build the project locally:

   ```bash
   yarn build
   ```

5. Build the Docker Compose stack:

   ```bash
   yarn docker:compose:build
   ```

6. Start the Docker Compose stack:

   ```bash
   yarn docker:compose:up
   ```

7. Run the setup script to create a new user and configure the payment method and email domain:

   ```bash
   yarn setup
   ```

   Open your browser and navigate to http://localhost:3025 to access MailDev to confirm the email address you used for the setup script.

8. Run the development mode to watch for changes on all packages:

   ```bash
   yarn dev
   ```

   Open your browser and navigate to http://localhost:3000 to access the frontend.

9. Happy coding!

### Visual Studio Code Workspace

If you want to use Visual Studio Code as your code editor, you can use the provided `.vscode/beabee.code-workspace` file to open the project in a workspace. This will allow you to have a single, unified view of the project, including all the necessary settings and extensions:

```bash
code .vscode/beabee.code-workspace
```

### Docker Compose

The Beabee project uses Docker Compose to manage its multi-container Docker application. The `docker-compose.yml` file defines the following services:

- `db`: PostgreSQL database
- `mail`: MailDev for email testing
- `app`: Main backend application
- `api_app`: API application
- `webhook_app`: Webhook handling application
- `img_upload_app`: Image upload service using PictShare
- `cron`: Cron job service
- `frontend`: New frontend application
- `app_router`: Router for the new frontend
- `router`: Router for the legacy app

#### Key Features:

1. **Database**: PostgreSQL is used with a named volume for data persistence.
2. **Email Testing**: MailDev is included for local email testing.
3. **Image Uploads**: PictShare is used for handling image uploads.
4. **Frontend**: The new frontend is built and served separately.
5. **Routing**: Separate routers are used for the new frontend and legacy app.

#### Environment Variables:

The Docker Compose setup relies on environment variables defined in the `.env` file. Make sure to set up your environment variables correctly as mentioned in the Initial Setup section.

#### Volumes:

Two named volumes are used:
- `db_data`: For persisting PostgreSQL data
- `upload_data`: For storing uploaded files

To start the Docker Compose stack, use the commands mentioned in the Initial Setup section:

```bash
yarn docker:compose:build
yarn docker:compose:up
```

This will build and start all the necessary services for the Beabee project.

#### Ports:

The Beabee project uses several ports for different services on development mode:

- `3000`: Frontend development server (Vite)
- `3002`: Router for the new frontend
- `3003`: New frontend application

- `3001`: Main application port (defined by MAIN_PORT in .env)
- `3004`: API application
- `3025`: MailDev for email testing (defined by MAIL_PORT in .env)
- `6543`: PostgreSQL database (mapped from container's 5432)

As you can see, you can access the frontend via three different ports. This is because the frontend is served by three different applications:

- Directly via Vite (http://localhost:3000)
- Router over Docker Compose (http://localhost:3002)
- Directly via Docker Compose (http://localhost:3003)

The recommended way is to use the Vite development server (http://localhost:3000), as this will give you hot module replacement (HMR) and other modern development features.

Accessing the frontend through the router (http://localhost:3002) mimics the production environment and can be used to test if the access works as it will be delivered later. This is useful for verifying the production-like behavior during development.

The direct Docker access (http://localhost:3003) can be used for debugging purposes, allowing you to inspect the raw output of the frontend container without any routing layer.

When running the project, make sure these ports are available on your local machine. You can access different parts of the application using these ports:

- Frontend: http://localhost:3000
- Main application: http://localhost:3001
- API application: http://localhost:3004
- MailDev interface: http://localhost:3025

Note: The actual ports used may vary based on your specific .env configuration. Always refer to your local .env file for the most accurate port settings.

### Development Mode

The `yarn dev` command starts the development mode for all packages in the monorepo. Here's what happens when you run this command:

#### Root Project

The root `yarn dev` command runs the dev scripts for all workspaces in parallel:

```bash
yarn workspaces foreach -v -W -p -i run dev
```

#### Backend

For the backend, `yarn dev` is an alias for `yarn dev:api`, which does the following:
1. Builds the project
2. Restarts the Docker Compose services
3. Runs three concurrent processes:
   - Watches for TypeScript changes and rebuilds
   - Watches for asset changes
   - Streams logs from the Docker containers

#### Frontend

The frontend's `yarn dev` command starts the Vite development server:

```bash
vite
```

This provides hot module replacement (HMR) for rapid development.

#### Common Package

For the common package, `yarn dev` is an alias for `yarn watch`, which runs concurrent watch processes for:
- Node.js ESM and CJS builds
- Browser builds
- TypeScript type definitions

#### Core Package

The core package's `yarn dev` command runs a TypeScript watch process:

```bash
tsc-watch --noClear -p tsconfig.build.json
```

This continuously compiles TypeScript files as they change.

By running `yarn dev` in the root of the project, you start development processes for all these packages simultaneously, allowing you to work on different parts of the project with live reloading and quick feedback.

### Other Developer Tools

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

### More Documentation

Documentation is currently limited. For more detailed guidance and documentation, please contact us directly.

## Contact Us

We're always excited to connect with our community, hear feedback, and answer any questions you might have! If you're interested in learning more about Beabee or have any questions, please feel free to reach out:

- **Issues**: [GitHub Issues](https://github.com/beabee-communityrm/monorepo/issues)
- **Email**: [tech@beabee.io](mailto:tech@beabee.io)

Your input is invaluable to us as we continue to grow and improve Beabee. Don't hesitate to get in touch!

## 🤝 Advertising

This project is tested with [BrowserStack](https://www.browserstack.com). As an open-source project, we have the privilege of using BrowserStack services for free, in exchange for acknowledging their support in our repository. BrowserStack is a comprehensive cloud web and mobile testing platform, enabling developers to test their websites and mobile applications across various browsers, operating systems, and real mobile devices.

## License

The Beabee Project is licensed under the [AGPL-3.0](./LICENSE) license.
