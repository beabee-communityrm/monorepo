import type { McpToolDefinition, McpToolResult } from '../types/mcp.ts';

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
