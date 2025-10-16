# Beabee Backend CLI

Command line interface for managing Beabee backend operations.

## Usage

> **Important**: This CLI tool can only be executed within the `api_app` Docker container and cannot be run locally.

The CLI provides several commands for managing different aspects of Beabee, you can see the list of commands by running `backend-cli --help`:

```bash
backend-cli --help
backend-cli <command>

Commands:
  backend-cli api-key <action>       Manage API keys
  backend-cli database <action>      Database management commands
  backend-cli user <action>          Manage users
  backend-cli setup <action>         Setup system settings
  backend-cli payment <action>       Manage payments
  backend-cli process <action>       Process background tasks
  backend-cli sync <action>          Sync with external services
  backend-cli test <action>          Test environment commands
  backend-cli migrate-uploads        Migrate uploads to S3

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```

You can also run `backend-cli <command> --help` to see the help for the command, for example:

```bash
backend-cli database --help
backend-cli database <action>

Database management commands

Commands:
  backend-cli database export                         Export database to JSON or SQL dump (contacts always anonymized)
  backend-cli database import <filePath>              Import database from JSON or SQL dump file
  backend-cli database import-callout-responses       Import callout responses from CSV file
    <calloutSlug> <filePath>

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```

### Database Commands

The `database` command provides tools for exporting and importing data:

#### Export Database

```bash
backend-cli database export [--anonymize] [--type json|sql] [--dryRun]
```

Exports the database with optional anonymization. Contact data is **always anonymized** for security.

Options:

- `--anonymize`: Anonymize all data (default: true). When false, only contacts are anonymized.
- `--type`: Export format - `json` or `sql` (default: json)
- `--dryRun`: Preview export without creating files (default: false)

Examples:

```bash
# Export fully anonymized database as JSON (default)
backend-cli database export

# Export as SQL with only contacts anonymized
backend-cli database export --anonymize=false --type=sql

# Preview export without creating files
backend-cli database export --dryRun
```

#### Import Database

```bash
backend-cli database import <filePath> [--type json|sql] [--dryRun]
```

Imports database from JSON or SQL dump file. The format is auto-detected from the file extension (.json or .sql) if not specified.

**JSON Format:** Standard JSON dump created by the export command

**SQL Format:** Alternating lines of SQL queries and JSON parameters:

```
INSERT INTO "table" ("col1", "col2") VALUES ($1, $2);
["value1", "value2"]
```

Options:

- `filePath`: Path to the dump file (required)
- `--type`: Import type - `json` or `sql` (auto-detected if not specified)
- `--dryRun`: Preview import without making changes (JSON only, default: false)

Examples:

```bash
# Import from JSON file (format auto-detected)
backend-cli database import /path/to/dump.json

# Import from SQL file with explicit type
backend-cli database import /path/to/dump.sql --type=sql

# Preview JSON import without making changes
backend-cli database import /path/to/dump.json --dryRun
```

#### Import Callout Responses

```bash
backend-cli database import-callout-responses <calloutSlug> <filePath>
```

Imports callout responses from CSV file.

**CSV Format:**

- Response data columns matching callout form components (format: `slideId.componentKey`)
- Optional metadata columns: `contact_email`, `guest_name`, `guest_email`, `bucket`, `created_at`

Examples:

```bash
# Import responses from CSV file
backend-cli database import-callout-responses my-survey /path/to/responses.csv
```

### Test Commands

The `test` command provides tools for testing and demo environments:

```bash
backend-cli test <action>

Test environment commands

Commands:
  backend-cli test list-users      List test users with various contribution scenarios
  backend-cli test anonymise       Create fully anonymized copy of database
  backend-cli test seed            Seed the database with test data from JSON dump
  backend-cli test export-demo     Export demo database with subset of data
```

#### Export Demo Database

```bash
backend-cli test export-demo [--type json|sql] [--dryRun]
```

Exports a subset of the database for demo purposes:

- 400 random contacts
- 20 latest callouts
- Related responses and data

All data is anonymized.

Examples:

```bash
# Export demo database as JSON
backend-cli test export-demo

# Export demo database as SQL
backend-cli test export-demo --type=sql
```

#### Seed Database

```bash
backend-cli test seed [--fileName <path>] [--dryRun]
```

Seeds the database with test data from a JSON dump file.

Examples:

```bash
# Seed from default file (database-dump.json)
backend-cli test seed

# Seed from specific file
backend-cli test seed --fileName /path/to/test-data.json

# Preview seeding without making changes
backend-cli test seed --dryRun
```

## Development

### Project Structure

```
src/
├── actions/       # Command implementation logic
│   ├── api-key/
│   ├── database/  # Database import/export actions
│   ├── payment/
│   ├── process/
│   ├── setup/
│   ├── sync/
│   ├── test/      # Testing and demo actions
│   └── user/
├── commands/      # Command definitions
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
├── env.ts         # Environment configuration
└── index.ts       # CLI entry point
```

## License

This project is part of Beabee and follows its licensing terms.
