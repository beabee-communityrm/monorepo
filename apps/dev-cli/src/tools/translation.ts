import {
  checkTranslationKey,
  getAvailableLocales,
  getTranslations,
  listTranslationKeys,
  validateTranslationUsage,
} from '../actions/translation.ts';
import type { McpToolDefinition, McpToolResult } from '../types/mcp.ts';
import type { ListTranslationKeysOptions } from '../types/translation.ts';

/**
 * MCP tool for checking if a translation key exists
 */
export const checkTranslationKeyTool: McpToolDefinition = {
  name: 'check_translation_key',
  description:
    'Check if a translation key exists and get information about its availability across locales',
  inputSchema: {
    type: 'object',
    properties: {
      key: {
        type: 'string',
        description: 'The translation key to check (e.g., "common.loading")',
      },
    },
    required: ['key'],
  },
  handler: async (args: { key: string }): Promise<McpToolResult> => {
    try {
      const result = await checkTranslationKey(args.key);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error checking translation key: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
};

/**
 * MCP tool for getting translation values across all locales
 */
export const getTranslationsTool: McpToolDefinition = {
  name: 'get_translations',
  description: 'Get translation values for a specific key across all locales',
  inputSchema: {
    type: 'object',
    properties: {
      key: {
        type: 'string',
        description:
          'The translation key to get values for (e.g., "actions.save")',
      },
    },
    required: ['key'],
  },
  handler: async (args: { key: string }): Promise<McpToolResult> => {
    try {
      const result = await getTranslations(args.key);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting translations: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
};

/**
 * MCP tool for listing available translation keys
 */
export const listTranslationKeysTool: McpToolDefinition = {
  name: 'list_translation_keys',
  description: 'List available translation keys with optional filtering',
  inputSchema: {
    type: 'object',
    properties: {
      prefix: {
        type: 'string',
        description:
          'Filter keys by prefix (e.g., "form." to get all form-related keys)',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of keys to return (default: no limit)',
        minimum: 1,
      },
      locale: {
        type: 'string',
        description: 'Locale to check for key existence (default: "en")',
      },
    },
    required: [],
  },
  handler: async (args: ListTranslationKeysOptions): Promise<McpToolResult> => {
    try {
      const result = await listTranslationKeys(args);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error listing translation keys: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
};

/**
 * MCP tool for validating translation key usage
 */
export const validateTranslationUsageTool: McpToolDefinition = {
  name: 'validate_translation_usage',
  description:
    'Validate translation key format and provide suggestions for improvements',
  inputSchema: {
    type: 'object',
    properties: {
      key: {
        type: 'string',
        description:
          'The translation key to validate (e.g., "user.profile.settings")',
      },
    },
    required: ['key'],
  },
  handler: async (args: { key: string }): Promise<McpToolResult> => {
    try {
      const result = await validateTranslationUsage(args.key);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error validating translation usage: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
};

/**
 * MCP tool for getting available locales
 */
export const getAvailableLocalesTool: McpToolDefinition = {
  name: 'get_available_locales',
  description: 'Get all available locales supported by the translation system',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
  handler: async (): Promise<McpToolResult> => {
    try {
      const locales = getAvailableLocales();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ locales }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting available locales: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
};
