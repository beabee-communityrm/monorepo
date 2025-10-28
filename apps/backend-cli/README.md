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
  backend-cli test <action>          Test environment utilities
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
  backend-cli database import [filePath]              Import database from JSON or SQL dump file (defaults to test data)
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
backend-cli database export [--subset full|demo] [--anonymize] [--type json|sql] [--outputDir <path>] [--dryRun]
```

Exports the database with configurable anonymization and output options. Contact data is **always anonymized** for security.

Options:

- `--subset`: Export subset - `full` for all data, `demo` for subset (400 contacts, 20 latest callouts) (default: full)
- `--anonymize`: Anonymize all data (default: true). When false, only contacts are anonymized, but **foreign key references are automatically remapped** to maintain referential integrity.
- `--type`: Export format - `json` or `sql` (default: json)
- `--outputDir`: Output directory for dump files (default: `../../packages/test-utils/database-dumps`)
- `--dryRun`: Preview export without creating files (default: false)

**Important:** When using `--anonymize=false`, contact IDs are always anonymized for privacy, and all foreign key references (like `contactId`, `assigneeId`) in other tables are automatically updated to match the new anonymized IDs. This ensures referential integrity is maintained.

Examples:

```bash
# Export fully anonymized database as JSON (default)
backend-cli database export

# Export demo subset (400 contacts, 20 latest callouts)
backend-cli database export --subset=demo

# Export as SQL with only contacts anonymized
backend-cli database export --anonymize=false --type=sql

# Export demo subset as SQL
backend-cli database export --subset=demo --type=sql

# Export to custom directory
backend-cli database export --outputDir /custom/path

# Preview export without creating files
backend-cli database export --dryRun
```

#### Import Database

```bash
backend-cli database import [filePath] [--type json|sql] [--dryRun]
```

Imports database from JSON or SQL dump file. The format is auto-detected from the file extension (.json or .sql) if not specified.

**Seeding**: When no file path is provided, automatically imports from the default test data dump (`../../packages/test-utils/database-dumps/database-dump.json`).

**JSON Format:** Standard JSON dump created by the export command

**SQL Format:** Alternating lines of SQL queries and JSON parameters:

```
INSERT INTO "table" ("col1", "col2") VALUES ($1, $2);
["value1", "value2"]
```

Options:

- `filePath`: Path to the dump file (optional, defaults to test data dump)
- `--type`: Import type - `json` or `sql` (auto-detected if not specified)
- `--dryRun`: Preview import without making changes (JSON only, default: false)

Examples:

```bash
# Seed database from default test data dump
backend-cli database import

# Import from specific JSON file (format auto-detected)
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

Imports callout responses from CSV file. This is a specialized import for human-readable CSV data (e.g., from surveys, spreadsheets).

**Note**: This is different from the regular `import` command which handles database dumps. Use this command when importing CSV data from external sources.

**CSV Format:**

- Response data columns matching callout form components (format: `slideId.componentKey`)
- Optional metadata columns: `contact_email`, `guest_name`, `guest_email`, `bucket`, `created_at`

The importer will:

- Parse different field types (numbers, checkboxes, addresses, file uploads, etc.)
- Link responses to existing contacts via email
- Handle guest responses
- Auto-increment response numbers

Examples:

```bash
# Import responses from CSV file
backend-cli database import-callout-responses my-survey /path/to/responses.csv
```

### Test Commands

The `test` command provides test-specific utilities:

```bash
backend-cli test <action>

Test environment utilities

Commands:
  backend-cli test list-users      List test users with various contribution scenarios
```

#### List Test Users

```bash
backend-cli test list-users [--dryRun]
```

Lists test users with various contribution scenarios for testing purposes.

Options:

- `--dryRun`: Preview without making changes (default: false)

Examples:

```bash
# List test users
backend-cli test list-users

# Preview listing
backend-cli test list-users --dryRun
```

## Database Operations

The CLI provides comprehensive database management capabilities with a focus on security and flexibility:

### Key Features

- **🔒 Security First**: Contact data is always anonymized in exports
- **🎯 Flexible Anonymization**: Choose between full anonymization or contact-only anonymization
- **📁 Environment-Aware**: Automatic path resolution for development vs production
- **🔄 Multiple Formats**: Support for both JSON and SQL export formats
- **🎭 Demo Exports**: Create subset exports for demo purposes (400 contacts, 20 latest callouts)
- **🌱 Easy Seeding**: Simple database seeding with `database import` (no file path needed)
- **📊 CSV Import**: Import callout responses from human-readable CSV files

### Output Directory Structure

```
packages/test-utils/database-dumps/              # Database dumps location
├── database-dump.json                 # Default seed file
├── example-database-dump.json         # Example format
├── README.md                          # Documentation
└── generated-dumps/                   # Timestamped exports
    ├── database-dump-2024-01-15T10-30-00-000Z.json
    └── ...
```

### Command Relationships

- `database export` - General purpose database export with configurable anonymization and subset options
  - Use `--subset=demo` for smaller demo exports (400 contacts, 20 latest callouts)
  - Use `--anonymize=false` to export non-sensitive data as-is (contacts still anonymized)
- `database import` - Import database dumps or seed from default test data
  - When called without arguments, seeds from default test data dump
  - When called with file path, imports from specific dump file
- `database import-callout-responses` - Import callout responses from CSV files (different from database dumps)
- `test list-users` - Lists test users for testing scenarios

## Development

### Project Structure

```
src/
├── actions/                  # Command implementation logic
│   ├── api-key/
│   ├── database/
│   │   ├── export.ts         # Export with full/demo subsets
│   │   ├── import.ts         # Import/seed from dumps
│   │   ├── import-callout-responses.ts  # CSV import
│   │   └── anonymization.ts  # Anonymization configuration
│   ├── payment/
│   ├── process/
│   ├── setup/
│   ├── sync/
│   ├── test/                 # Test-specific utilities
│   └── user/
├── commands/                 # Command definitions
├── types/                    # TypeScript type definitions
├── utils/                    # Utility functions
├── env.ts                    # Environment configuration
└── index.ts                  # CLI entry point
```

## License

This project is part of Beabee and follows its licensing terms.
