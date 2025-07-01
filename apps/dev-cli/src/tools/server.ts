import type { McpToolDefinition, McpToolResult } from '../types/mcp.ts';
import * as _tools from './index.ts';

/**
 * MCP tool for listing all available tools
 */
export const listToolsTool: McpToolDefinition = {
  name: 'list_tools',
  description: 'List all available MCP tools and their descriptions',
  inputSchema: {
    type: 'object',
    properties: {
      format: {
        type: 'string',
        enum: ['simple', 'detailed'],
        description: 'Output format',
        default: 'simple',
      },
    },
    required: [],
  },
  handler: async (args: {
    format?: 'simple' | 'detailed';
  }): Promise<McpToolResult> => {
    try {
      const format = args.format || 'simple';
      const tools = Object.values(_tools);

      let output: string;

      if (format === 'detailed') {
        output = `Available MCP Tools (${tools.length}):\n\n`;
        for (const tool of tools) {
          output += `• ${tool.name}\n`;
          output += `  Description: ${tool.description}\n`;
          const schema = tool.inputSchema as any;
          output += `  Required params: ${schema.required?.join(', ') || 'none'}\n\n`;
        }
      } else {
        output = `Available MCP Tools (${tools.length}):\n`;
        output += tools
          .map((tool) => `• ${tool.name} - ${tool.description}`)
          .join('\n');
      }

      return {
        content: [
          {
            type: 'text',
            text: output,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error listing tools: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
};

/**
 * MCP tool for restarting the server to reload new tools
 */
export const restartServerTool: McpToolDefinition = {
  name: 'restart_server',
  description: 'Restart the MCP server to reload new tools and changes',
  inputSchema: {
    type: 'object',
    properties: {
      reason: {
        type: 'string',
        description: 'Optional reason for restarting the server',
        default: 'Manual restart requested',
      },
    },
    required: [],
  },
  handler: async (args: { reason?: string }): Promise<McpToolResult> => {
    try {
      const reason = args.reason || 'Manual restart requested';

      // Log the restart reason
      console.error(`🔄 Restarting MCP server: ${reason}`);

      // Schedule restart after sending response
      setTimeout(() => {
        console.error('🛑 Shutting down for restart...');
        process.exit(0);
      }, 100);

      return {
        content: [
          {
            type: 'text',
            text: `Server restart initiated: ${reason}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error restarting server: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
};
