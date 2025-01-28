# Beabee Backend CLI

Command line interface for managing Beabee backend operations.

## Usage

> **Important**: This CLI tool can only be executed within the `api_app` Docker container and cannot be run locally.

The CLI provides several commands for managing different aspects of Beabee, you can see the list of commands by running `backend-cli --help`:

```bash
backend-cli --help
backend-cli <command>

Commands:
  index.js api-key <action>  Manage API keys
  index.js user <action>     Manage users
  index.js configure         Configure system settings

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```

You can also run `backend-cli <command> --help` to see the help for the command, for example:

```bash
backend-cli api-key --help
backend-cli api-key <action>

Manage API keys

Commands:
  index.js api-key create       Create a new API key
  index.js api-key delete <id>  Delete an API key

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```

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
