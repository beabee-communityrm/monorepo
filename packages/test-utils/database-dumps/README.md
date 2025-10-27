# Database Dump Format

This directory contains database dumps in JSON format that can be used to seed test databases with sample data.

## JSON Format

The JSON dump files use a simple, user-friendly structure:

```json
{
  "table_name": [
    {
      "column1": "value1",
      "column2": "value2",
      ...
    },
    {
      "column1": "value3",
      "column2": "value4",
      ...
    }
  ],
  "another_table": [
    ...
  ]
}
```

### Key Features

- **Table-based structure**: Each key represents a database table name
- **Array of records**: Each table contains an array of record objects
- **TypeORM compatible**: Uses TypeORM repositories for database operations
- **Easy to edit**: Standard JSON format that can be edited with any text editor

## Files

- `database-dump.json` - The default dump file used by the seed command
- `example-database-dump.json` - Example showing the expected format
- `created/` - Directory containing timestamped dumps created by the anonymizer

## Usage

### Seeding the Database

Use the CLI command to seed your database:

```bash
# Use the default database-dump.json file
yarn backend-cli test seed

# Use a specific file name (has to be placed in the mounted volume under test-utils/database-dump)
yarn backend-cli test seed --fileName your-dump.json

```

### Creating Dumps

Generate anonymized dumps from existing data:

```bash
# Create a new anonymized dump
yarn backend-cli test anonymise
```

This will create a timestamped file in the `created/` directory and also update `database-dump.json`.

## Editing Dumps

You can manually edit the JSON files to:

- Add new test records
- Modify existing data
- Remove unwanted records
- Create specific test scenarios

### Important Notes

1. **Foreign Key Relationships**: Ensure that referenced IDs exist in related tables
2. **Data Types**: Use appropriate JSON data types (strings, numbers, booleans, null)
3. **Date Format**: Use ISO 8601 format for dates: `"2024-01-01T00:00:00.000Z"`
4. **UUIDs**: Use valid UUID format for ID fields: `"550e8400-e29b-41d4-a716-446655440000"`

### Example Record Types

See `example-database-dump.json` for examples of:

- User accounts with different roles
- Organization settings
- Membership data
- And more...

## Database Operations

The seeding process:

1. **Clears existing data** from each table (in reverse order to respect foreign keys)
2. **Inserts new records** using TypeORM repositories
3. **Validates data** according to entity definitions
4. **Maintains referential integrity** through proper ordering

## Troubleshooting

- **"No entity found for table"**: The table name doesn't match any TypeORM entity
- **Foreign key violations**: Referenced IDs don't exist in related tables
- **Invalid JSON**: Check syntax with a JSON validator
- **Type errors**: Ensure data types match entity field definitions
