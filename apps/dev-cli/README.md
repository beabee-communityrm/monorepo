# @beabee/dev-cli

Development CLI for Beabee monorepo - provides common development tasks and utilities.

## Installation

The CLI is available as a workspace package. From anywhere in the monorepo:

```bash
# Short form (recommended)
yarn dev-cli <command>

# Full workspace command
yarn workspace @beabee/dev-cli start <command>
```

## Commands

### `generate-index`

Automatically generates index.ts files that export all TypeScript files in specified directories.

```bash
yarn dev-cli generate-index -p <directories...>
```

**Options:**

- `-p, --paths` (required): Directories where index files should be generated
- `--ext, --extension`: File extension for imports (`js`, `ts`, `none`). Default: `js`
- `-b, --baseDir`: Base directory to resolve paths from. Default: current directory

**Examples:**

```bash
# Generate index files for multiple directories
yarn dev-cli generate-index -p ./src/types ./src/utils ./src/api

# Use TypeScript extensions in imports
yarn dev-cli generate-index -p ./src/components --ext ts

# Generate for packages from monorepo root
yarn dev-cli generate-index -p packages/common/src/types packages/common/src/utils

# Specify base directory
yarn dev-cli generate-index -p ./src/types ./src/api --baseDir packages/client
```

### `esbuild`

Build packages using the shared esbuild configuration.

```bash
yarn dev-cli esbuild
```

**Options:**

- `--entry, --entryPoints`: Entry points for build. Default: `["./src/index.ts", "./src/**/*.ts"]`
- `-w, --watch`: Enable watch mode for continuous rebuilding. Default: `false`
- `-b, --baseDir`: Base directory to resolve paths from. Default: current directory

**Examples:**

```bash
# Build a package
yarn dev-cli esbuild

# Build with watch mode
yarn dev-cli esbuild --watch

# Build from specific directory
yarn dev-cli esbuild --baseDir packages/vue

# Custom entry points
yarn dev-cli esbuild --entry ./src/main.ts ./src/helpers/**/*.ts
```

### `translation`

Translation key management and validation tools using @beabee/locale.

```bash
yarn dev-cli translation <subcommand>
```

**Subcommands:**

#### `locales`
List all available locales in the translation system.

```bash
yarn dev-cli translation locales
```

#### `check-key`
Check if a translation key exists across all locales.

```bash
yarn dev-cli translation check-key <key>
```

**Examples:**
```bash
# Check if a key exists
yarn dev-cli translation check-key common.loading

# Check nested key
yarn dev-cli translation check-key user.profile.settings
```

#### `get`
Get translation values for a key across all locales.

```bash
yarn dev-cli translation get <key>
```

**Examples:**
```bash
# Get translations for a key
yarn dev-cli translation get actions.save

# Get nested key translations
yarn dev-cli translation get form.validation.required
```

#### `list-keys`
List available translation keys with optional filtering.

```bash
yarn dev-cli translation list-keys [options]
```

**Options:**
- `--prefix`: Filter keys by prefix (e.g., "form." for form-related keys)
- `--limit`: Maximum number of keys to return
- `--locale`: Locale to check for key existence (default: "en")

**Examples:**
```bash
# List all keys
yarn dev-cli translation list-keys

# List keys with prefix
yarn dev-cli translation list-keys --prefix form.

# Limit results
yarn dev-cli translation list-keys --limit 50

# Check specific locale
yarn dev-cli translation list-keys --locale de
```

#### `validate`
Validate translation key format and get suggestions.

```bash
yarn dev-cli translation validate <key>
```

**Examples:**
```bash
# Validate key format
yarn dev-cli translation validate user.profile.settings

# Validate potentially problematic key
yarn dev-cli translation validate "user-profile_settings"
```

### `mcp`

Start an MCP (Model Context Protocol) server to expose development tools to AI assistants.

```bash
yarn dev-cli mcp [options]
```

**Options:**
- `--name`: Server name (default: "beabee-dev-cli")
- `--server-version`: Server version (default: package version)
- `--debug`: Enable debug logging

**Examples:**
```bash
# Start MCP server
yarn dev-cli mcp

# Start with debug logging
yarn dev-cli mcp --debug

# Start with custom name
yarn dev-cli mcp --name "beabee-dev-tools"
```

**Available MCP Tools:**
- `check_translation_key` - Check if a translation key exists across locales
- `get_translations` - Get translation values for a key across all locales  
- `list_translation_keys` - List available translation keys with filtering
- `validate_translation_usage` - Validate key format and get suggestions
- `get_available_locales` - Get all supported locales

## MCP Integration

The MCP server is automatically configured for Cursor IDE through the `.cursor/mcp.json` configuration file in the workspace root. This allows AI assistants to access translation validation tools directly from within Cursor.

### Cursor IDE Integration

The MCP server is automatically available in Cursor when working in this workspace. The configuration in `.cursor/mcp.json` includes:

```json
{
  "mcpServers": {
    "beabee-dev-cli": {
      "command": "node",
      "args": [
        "--experimental-specifier-resolution=node",
        "--experimental-strip-types",
        "--no-warnings",
        "${workspaceFolder}/apps/dev-cli/src/index.ts",
        "mcp"
      ]
    }
  }
}
```

### Other MCP Clients

To integrate with other MCP-compatible clients (Claude Desktop, VS Code with MCP support, etc.), use one of the following configurations:

#### Stdio Transport (Recommended)

```json
{
  "mcpServers": {
    "beabee-dev-cli": {
      "command": "yarn",
      "args": ["workspace", "@beabee/dev-cli", "start", "mcp"],
      "cwd": "/path/to/beabee/monorepo"
    }
  }
}
```

#### Direct Node Execution

```json
{
  "mcpServers": {
    "beabee-dev-cli": {
      "command": "node",
      "args": [
        "--experimental-specifier-resolution=node",
        "--experimental-strip-types", 
        "--no-warnings",
        "/path/to/beabee/monorepo/apps/dev-cli/src/index.ts",
        "mcp"
      ],
      "cwd": "/path/to/beabee/monorepo"
    }
  }
}
```

#### Claude Desktop Configuration

For Claude Desktop, add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "beabee-dev-cli": {
      "command": "yarn",
      "args": ["workspace", "@beabee/dev-cli", "start", "mcp"],
      "cwd": "/path/to/beabee/monorepo"
    }
  }
}
```

**Note:** Replace `/path/to/beabee/monorepo` with the actual path to your workspace root directory.

## Technical Details

- Runs TypeScript directly without compilation using Node.js experimental features
- All operations are async for better performance
- Generates sorted exports for consistent output
- Integrates with the shared @beabee/esbuild configuration
- MCP server exposes development tools to AI assistants via JSON-RPC protocol

## Extending the CLI

### Adding New Commands

To add new commands:

1. Create types in `src/types/your-command.ts`
2. Create action logic in `src/actions/your-command.ts`
3. Create command definition in `src/commands/your-command.ts`
4. Export from respective index files
5. Add command to `src/index.ts`

### Adding MCP Tools

To add new MCP tools:

1. Create tool definitions in `src/tools/your-tools.ts`
2. Export tools from `src/tools/index.ts`
3. Tools are automatically registered with the MCP server

Each MCP tool should implement the `McpToolDefinition` interface:

```typescript
export const yourTool: McpToolDefinition = {
  name: 'your_tool_name',
  description: 'Description of what the tool does',
  inputSchema: {
    type: 'object',
    properties: {
      // Define input parameters
    },
    required: ['required_params'],
  },
  handler: async (args: YourArgsType): Promise<McpToolResult> => {
    // Tool implementation
  },
};
```

## Development

```bash
# Type checking
yarn workspace @beabee/dev-cli run check

# Format code
yarn workspace @beabee/dev-cli run format
```

## License

This project is part of Beabee and follows its licensing terms.
