# Database Anonymisers Module

This module provides tools for anonymizing, exporting, and importing database data with support for JSON and SQL formats.

## Module Structure

The module has been refactored into focused, single-responsibility files:

### Core Files

- **`index.ts`** - Main entry point that re-exports all public APIs
- **`types.ts`** - TypeScript type definitions and interfaces
- **`utils.ts`** - Utility functions (file path creation, stringification)
- **`models.ts`** - Model anonymizer definitions (existing file)

### Functional Modules

- **`anonymizer.ts`** - Core anonymization logic

  - `anonymiseItem()` - Anonymize individual records
  - `anonymiseModel()` - Anonymize entire models with batching
  - `exportModelAsIs()` - Export models without anonymization, but with FK remapping
  - `extractForeignKeyMap()` - Extract only FK fields from anonymizer for selective remapping

- **`json-dump.ts`** - JSON dump management

  - `initializeJsonDump()` - Initialize JSON export
  - `writeItemsToJsonDump()` - Write records to JSON dump
  - `saveJsonDump()` - Save JSON dump to file
  - `validateDumpStructure()` - Validate dump integrity

- **`sql-dump.ts`** - SQL dump management

  - `initializeSqlDump()` - Initialize SQL export with DELETE statements
  - `writeItemsToSqlDump()` - Write records as SQL INSERT statements
  - `saveSqlDump()` - Finalize and close SQL dump file
  - `clearModels()` - Generate DELETE statements

- **`importer.ts`** - Database import/seeding
  - `writeJsonToDB()` - Import JSON dumps into database

## Usage

All public APIs are exported from `index.ts`, so imports remain the same:

```typescript
import {
  anonymiseModel,
  exportModelAsIs,
  initializeJsonDump,
  initializeSqlDump,
  saveJsonDump,
  saveSqlDump,
  writeJsonToDB,
} from '@beabee/core/tools/database/anonymisers';
```

## File Organization Benefits

1. **Single Responsibility** - Each file has a clear, focused purpose
2. **Maintainability** - Easier to locate and modify specific functionality
3. **Testability** - Individual modules can be tested in isolation
4. **Readability** - Smaller files are easier to understand
5. **Scalability** - New export formats can be added as separate modules

## Export/Import Flow

### JSON Export Flow

1. `initializeJsonDump()` - Create in-memory structure
2. `anonymiseModel()` → `writeItemsToJsonDump()` - Anonymize and collect data
3. `saveJsonDump()` - Write to timestamped file

### SQL Export Flow

1. `initializeSqlDump()` - Create file stream and write DELETE statements
2. `anonymiseModel()` → `writeItemsToSqlDump()` - Anonymize and write INSERT statements
3. `saveSqlDump()` - Close file stream

### Import Flow

1. `writeJsonToDB()` - Read JSON, validate, clear tables, insert data

## Foreign Key Remapping

When exporting with `--anonymize=false`:

1. **Contacts are always anonymized** (security requirement)
2. **Other models are exported as-is** (no anonymization)
3. **Foreign keys are remapped** to maintain referential integrity

### How It Works

The system tracks ID mappings in a `valueMap`:

- Contact ID `"abc-123"` → `"new-uuid-456"`
- When exporting non-anonymized models, FK fields (fields ending in `Id`) are automatically remapped
- Non-FK fields remain unchanged

### Example

```typescript
// Contact exported with anonymization
{ id: "abc-123" } → { id: "new-uuid-456" }

// CalloutResponse exported without anonymization (--anonymize=false)
{
  id: "response-1",           // ✓ Kept as-is (not a FK)
  contactId: "abc-123",       // ✓ Remapped to "new-uuid-456" (FK)
  answers: {...},             // ✓ Kept as-is (not a FK)
  guestEmail: "test@test.com" // ✓ Kept as-is (not a FK)
}
```

This ensures that exported data maintains valid foreign key relationships even when mixing anonymized and non-anonymized exports.
