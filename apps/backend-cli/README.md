# Beabee Backend CLI

Command line interface for managing Beabee backend operations.

## Usage

> **Important**: This CLI tool can only be executed within the `api_app` Docker container and cannot be run locally.

The CLI provides several commands for managing different aspects of Beabee, you can see the list of commands by running `yarn backend-cli --help`:

```bash
yarn backend-cli --help
yarn backend-cli <command>

Commands:
  yarn backend-cli api-key <action>  Manage API keys
  yarn backend-cli user <action>     Manage users
  yarn backend-cli setup <action>    Configure system settings
  yarn backend-cli payment <action>  Payment management commands
  yarn backend-cli process <action>  Processing commands
  yarn backend-cli rate-limiter      Manage rate limiter functionality
  yarn backend-cli sync <action>     Synchronization commands
  yarn backend-cli test <action>     Test environment commands
  yarn backend-cli migrate-uploads   Migrate uploads from local storage to MinIO

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```

## Available Commands

### API Key Management
```bash
yarn backend-cli api-key list         List all API keys
yarn backend-cli api-key create       Create a new API key
yarn backend-cli api-key delete <id>  Delete an API key
```

### User Management
```bash
yarn backend-cli user list [email]    List users
yarn backend-cli user create          Create a new user
yarn backend-cli user delete <email>  Permanently delete a user
```

### System Setup
```bash
yarn backend-cli setup support-email    Set up support email configuration
yarn backend-cli setup payment-methods  Set up payment methods configuration
yarn backend-cli setup admin            Set up initial admin user
yarn backend-cli setup all              Complete system setup (all steps in sequence)
```

### Payment Management
```bash
yarn backend-cli payment create        Create a new payment
yarn backend-cli payment list [email]  List payments
```

### Processing Commands
```bash
yarn backend-cli process gifts  Process pending gifts
```

### Rate Limiter Management
```bash
yarn backend-cli rate-limiter clear  Clear the rate limiter cache
```

### Synchronization Commands
```bash
yarn backend-cli sync mailchimp  Sync newsletter status with Mailchimp
yarn backend-cli sync segments   Process segment memberships
yarn backend-cli sync stripe     Sync Stripe subscriptions and payments
```

### Test Environment Commands
```bash
yarn backend-cli test list-users  List test users with various contribution scenarios
```

### Migration Commands
```bash
yarn backend-cli migrate-uploads  Migrate uploads from local storage to MinIO using ImageService and DocumentService
```

You can also run `yarn backend-cli <command> --help` to see the help for any specific command.

## Development

### Project Structure

```
src/
├── actions/       # Command implementation logic
├── commands/      # Command definitions
├── env.ts         # Environment configuration
└── index.ts       # CLI entry point
```

## License

This project is part of Beabee and follows its licensing terms.
