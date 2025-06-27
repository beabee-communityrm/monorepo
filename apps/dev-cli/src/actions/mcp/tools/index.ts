import type { McpToolDefinition } from '../../../types/mcp.ts';
import {
  checkTranslationKeyTool,
  getAvailableLocalesTool,
  getTranslationsTool,
  listTranslationKeysTool,
  validateTranslationUsageTool,
} from './translation.ts';

/**
 * Registry of all available MCP tools
 *
 * This file will be extended when we add specific MCP tools.
 * Each tool should be implemented in its own file within this directory.
 */
export const mcpTools: McpToolDefinition[] = [
  // Translation validation tools
  checkTranslationKeyTool,
  getTranslationsTool,
  listTranslationKeysTool,
  validateTranslationUsageTool,
  getAvailableLocalesTool,
  // Future tools will be added here
  // Example:
  // esbuildTool,
  // generateIndexTool,
];

/**
 * Get all available MCP tools
 */
export function getAllMcpTools(): McpToolDefinition[] {
  return mcpTools;
}

/**
 * Get MCP tool by name
 */
export function getMcpTool(name: string): McpToolDefinition | undefined {
  return mcpTools.find((tool) => tool.name === name);
}
